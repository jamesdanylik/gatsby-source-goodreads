const crypto = require("crypto")
const fetch = require("node-fetch")
const queryString = require("query-string")
const xml = require("xml2js")

exports.sourceNodes = ({ actions, createNodeId}, configOptions) => {
	const { createNode } = actions
	
	delete configOptions.plugins

	const processNode = (node) => {
		const nodeId = node.id
		const typeName = node.typeName
		delete node.id
		delete node.typeName

		const nodeContent = JSON.stringify(node)
		const nodeContentDigest = crypto
			.createHash("md5")
			.update(nodeContent)
			.digest("hex")

		const nodeData = Object.assign({}, node, {
			id: nodeId,
			parent: null,
			children: [],
			internal: {
				type: typeName,
				content: nodeContent,
				contentDigest: nodeContentDigest
			}
		})

		if(nodeData.internal == null) {
			console.log(nodeData)
		}

		return createNode(nodeData)
	}

	const apiFetch = async (url) => {
		return fetch(url)
			.then(response => {
				return response.text()
			})
	}

	const unpack = (obj) => {
		var unpacked = {}
		for(var key in obj) {
			unpacked[key] = obj[key][0]

			const singularForms = {
				shelves: "shelf",
				authors: "author"
			}
			for( var plural in singularForms) {
				if( (typeof unpacked[key] === "object") && key == plural) {
					unpacked[key] = unpacked[key][singularForms[plural]].map(item => {
						if( key != "shelves" ) {
							return unpack(item)
						} else {
							return item["$"]
						}
					})
				}
			}
			if( (typeof unpacked[key] === "object") && unpacked[key].hasOwnProperty("_") ) {
        unpacked[key] = unpacked[key]["_"]
      }
			if( (typeof unpacked[key] == "object") && unpacked[key].hasOwnProperty("$")) {
				unpacked[key] = unpacked[key]["$"]
			}
			if( (typeof unpacked[key] === "object") && !Array.isArray(unpacked[key]) && !unpacked[key].hasOwnProperty("_")) {
				unpacked[key] = unpack(unpacked[key])
			}
			if( key.startsWith("isbn") && (typeof unpacked[key] == "object") && (unpacked[key].nil == "t")) {
				unpacked[key] = ''
			}
		}
		return unpacked
	}

	return new Promise( async (resolve, reject) => {
		var reviews = {}
		var authors = {}
		var books = {}
		var shelves = {}

		var sourceDone = false
		var pageNum = 1
		var raw

		while(!sourceDone) {
			const roundOptions = {
				page: pageNum,
				per_page: 200,
				v: 2,
			}

			const pageOptions = Object.assign({}, configOptions, roundOptions)
			const apiOptions = queryString.stringify(pageOptions)
			const apiUrl = `https://www.goodreads.com/review/list?${apiOptions}`
			//console.log(`\nFetch Goodreads:\n\t${apiUrl}\n`)

			raw = await apiFetch(apiUrl)

			xml.parseString(raw, { trim: true }, (error, result) => {
				if(error) {
					return reject("Invalid response from Goodreads: XML failed to parse")
				}

				if( !(result.hasOwnProperty("GoodreadsResponse") 
					&& result.GoodreadsResponse.hasOwnProperty("reviews")
					&& Array.isArray(result.GoodreadsResponse.reviews)
					&& (result.GoodreadsResponse.reviews.length == 1))) {
					return reject("Invalid response from Goodreads: unexpected XML structure")
				}

				const response = result.GoodreadsResponse.reviews[0]

				response.review.forEach(rawReview => {
					var review = unpack(rawReview)
	
					var book = review.book
					var bookAuthors = review.book.authors
					var reviewShelves = review.shelves

					delete review.book
					delete review.shelves
					delete book.authors

					const reviewId = createNodeId(`goodreads-review-${review.id}`)
					review.goodreadsId = review.id
					review.id = reviewId
					review.typeName = "GoodreadsReview"

					const bookId = createNodeId(`goodreads-book-${book.id}`)
					if(!books[bookId]) {
						book.goodreadsId = book.id
						book.id = bookId
						book.typeName = "GoodreadsBook"
						book.reviews___NODE = []
						book.authors___NODE = []
						books[bookId] = book
					} 
					books[bookId].reviews___NODE.push(reviewId)
					review.book___NODE = bookId

					bookAuthors.forEach(author => {
						const authorId = createNodeId(`goodreads-author-${author.id}`)
						if(!authors[authorId]) {
							author.goodreadsId = author.id
							author.id = authorId
							author.typeName = "GoodreadsAuthor"
							author.books___NODE = []
							authors[authorId] = author
						}
						authors[authorId].books___NODE.push(bookId)
						books[bookId].authors___NODE.push(authorId)
					})

					reviewShelves.forEach(shelf => {
						const shelfId = createNodeId(`goodreads-shelf-${shelf.id}`)
						if(!shelves[shelfId]) {
							shelf.goodreadsId = shelf.id
							shelf.id = shelfId
							shelf.typeName = "GoodreadsShelf"
							shelf.reviews___NODE = []
							shelves[shelfId] = shelf
						} 
						shelves[shelfId].reviews___NODE.push(reviewId)
					})
					
					reviews[reviewId] = review
				})
				
				if(response["$"]["end"] == response["$"]["total"]) {
					sourceDone = true
				} else {
					pageNum += 1
				}
			})
		}
		
		[reviews, authors, books, shelves].forEach(collection => {
			for(var key in collection) {
				processNode(collection[key])
			}
		})

		resolve()
	})
}
