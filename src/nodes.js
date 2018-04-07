import createNodeHelpers from 'gatsby-node-helpers'

const {
	createNodeFactory,
	generateNodeId,
	generateTypeName,
} = createNodeHelpers({
	typePrefix: `Goodreads`,
})

export const REVIEW_TYPE = `Review`
export const SHELF_TYPE = `Shelf`
export const BOOK_TYPE = `Book`
export const AUTHOR_TYPE = `Author`


export {generateNodeId}

export const ReviewNode = createNodeFactory(REVIEW_TYPE)
export const ShelfNode = createNodeFactory(SHELF_TYPE)
export const BookNode = createNodeFactory(BOOK_TYPE)
export const AuthorNode = createNodeFactory(AUTHOR_TYPE)