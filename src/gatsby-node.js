import {
	ReviewNode,
	ShelfNode,
	BookNode,
	AuthorNode,
	generateNodeId,
	REVIEW_TYPE, 
	SHELF_TYPE,
	BOOK_TYPE, 
	AUTHOR_TYPE
} from './nodes'
import fetch from 'isomorphic-fetch'
import {parseString} from 'xml2js'


function api(url) {
	return fetch(url).then(results=> {
		return results.text()
	})
}

function reviewsUrl(options) {
	var url = ' https://www.goodreads.com/review/list?v=2'
	for(var property in options) {
		url += '&' + property + '=' + options[property]
	}
	return url
}

function unpack(obj) {
	var ret;
	if(typeof obj[0] !== 'object') {
		ret = obj[0]
	} 
	else if (obj[0].hasOwnProperty('shelf')) { // shelves?
		var shelf_nodes = {}
		var real_ret = []
		obj.forEach(shelf => {
			var shelfObj = {}

			var keys = [
				"name",
				"exclusive",
				"id",
				"review_shelf_id"
			]

			keys.forEach(key => {
				shelfObj[key] = shelf.shelf[0]['$'][key]
			})

			//prep review link

			shelfObj.reviews___NODE = []

			shelf_nodes[generateNodeId(SHELF_TYPE, shelfObj.id)] = ShelfNode(shelfObj)
			real_ret.push(generateNodeId(SHELF_TYPE, shelf.shelf[0]['$']['id']))
		})
		ret = {
				shelves: shelf_nodes,
				ret: real_ret
		}
	}
	else {
		if(obj[0].hasOwnProperty('_')) {
			ret = obj[0]['_']
		}
		else if (obj[0].hasOwnProperty('author')) { // authors
			var new_authors = {}
			var real_ret = []
			obj[0]['author'].forEach(author => {
				real_ret.push(generateNodeId(AUTHOR_TYPE, unpack(author.id)))

				var authorObj = {}
				var keys = [
					"id",
					"name",
					"role",
					"image_url",
					"small_image_url",
					"link",
					"average_rating",
					"ratings_count",
					"text_reviews_count"
				]

				keys.forEach(key => {
					authorObj[key] = unpack(author[key])
				})

				//prep book link
				authorObj.books___NODE = []

				new_authors[generateNodeId(AUTHOR_TYPE, unpack(author.id))] = AuthorNode(authorObj)
			})
			ret = {
				authors: new_authors,
				ret: real_ret
			}
		}
		else if (obj[0].hasOwnProperty('id')) { // works
			ret = {
				id: obj[0]['id'][0],
				uri: obj[0]['uri'][0]
			}
		}
	}
	//console.log(obj + ' => ' + ret)
	return ret
}

exports.sourceNodes = async({boundActionCreators}, {
	api_key,
	user_id
}) => {
	const { createNode } = boundActionCreators

	var xml = await api(reviewsUrl({key: api_key, id: user_id, per_page:200}))

	var reviews = {}
	var authors = {}
	var books = {}
	var shelves = {}

	parseString(xml, {trim: true}, (err, result) => {
		//console.log(result)

		//console.log('\nGot ' + result.GoodreadsResponse.reviews.length + " reviews")
		result.GoodreadsResponse.reviews.forEach(reviewResp => {
			reviewResp.review.forEach(review => {
				const b = review.book[0]
				if(books[generateNodeId(BOOK_TYPE, unpack(b.id))]) {
					// book already exists, just link
					books[generateNodeId(BOOK_TYPE, unpack(b.id))].reviews___NODE.push(
						generateNodeId(REVIEW_TYPE, unpack(review.id))
					)
				} else {
					var bookObj = {}
					const keys =  [
						"id", 
						"isbn", 
						"isbn13", 
						"text_reviews_count", 
						"uri", 
						"title", 
						"title_without_series", 
						"image_url", 
						"small_image_url", 
						"large_image_url", 
						"link", 
						"num_pages", 
						"format", 
						"edition_information", 
						"publisher", 
						"publication_day", 
						"publication_month", 
						"publication_year", 
						"average_rating", 
						"ratings_count", 
						"description", 
						"authors", 
						"published", 
						"work"
					]
					keys.forEach(key => {
						bookObj[key] = unpack(b[key])
					})

					// post process authors
					var authorNodes = bookObj.authors.authors
					bookObj.authors___NODE = bookObj.authors.ret
					delete bookObj.authors

					for(var key in authorNodes) {
						if(!(key in authors)) {
							authorNodes[key].books___NODE.push(generateNodeId(BOOK_TYPE, unpack(b.id)))
							authors[key] = authorNodes[key]
						}
						else {
							authors[key].books___NODE.push(generateNodeId(BOOK_TYPE, unpack(b.id)))
						}
					}

					// Add review link
					bookObj.reviews___NODE = [generateNodeId(REVIEW_TYPE, unpack(review.id))]

					books[generateNodeId(BOOK_TYPE, unpack(b.id))] = BookNode(bookObj)
				}

				var reviewObj = {}
				const keys = [
					"id",
					"rating",
					"votes",
					"spoiler_flag",
					"spoilers_state",
					"shelves", // need to post process
					"recommended_for",
					"recommended_by",
					"started_at",
					"read_at",
					"date_added",
					"date_updated",
					"read_count",
					"body",
					"comments_count",
					"url",
					"link",
					"owned"
				]

				keys.forEach(key => {
					reviewObj[key] = unpack(review[key])
				})

				var shelfNodes = reviewObj.shelves.shelves
				reviewObj.shelves___NODE = reviewObj.shelves.ret
				delete reviewObj.shelves

				for(var key in shelfNodes) {
					if(!(key in shelves)) {
						shelfNodes[key].reviews___NODE.push(generateNodeId(REVIEW_TYPE, unpack(review.id)))
						shelves[key] = shelfNodes[key]
					}
					else {
						shelves[key].reviews___NODE.push(generateNodeId(REVIEW_TYPE, unpack(review.id)))
					}
				}

				// Add book link
				reviewObj.book___NODE = generateNodeId(BOOK_TYPE, unpack(b.id))

				createNode(ReviewNode(reviewObj))
			})
		})

		//console.log("\nCreating " + Object.keys(authors).length + " authors")
		for(var key in authors) {
			createNode(authors[key])
		}

		//console.log("\nCreating " + Object.keys(books).length + " books")
		for(var key in books) {
			createNode(books[key])
		}

		//console.log("\n Creaing " + Object.keys(shelves).length + " shelves")
		for(var key in shelves) {
			createNode(shelves[key])
		}
	})

	return
}