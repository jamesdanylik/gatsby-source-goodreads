# gatsby-source-goodreads

This is a source plugin for GatsbyJS to pull information from the GoodReads API.  It grabs all the books, author, and shelf information for a single user.   

## **WARNING**
This plugin is in pre-release status!  **It currently only provides the first 200 books and authors for a user -- no review information or shevles yet**; these are still in progress.  Check back soon, file a pull request, or just use at your own risk until this warning is removed!

## Install

```bash
npm install --save gatsby-source-goodreads
```


## Configuration
```javascript
// In your gatsby-config.js
plugins: [
	{
	      resolve: "gatsby-source-goodreads",
	      options: {
            api_key: '<<YOUR GOODREADS API KEY>>'
	        user_id: '<<USER ID TO TRACK>>'
	      },
	},
	...
]
```

## Provided Queries

### Books
```graphql
  allGoodreadsBook {
    edges {
      node {
        id, 
        isbn, 
        isbn13, 
        text_reviews_count, 
        uri, 
        title, 
        title_without_series, 
        image_url, 
        small_image_url, 
        large_image_url, 
        link, 
        num_pages, 
        format, 
        edition_information, 
        publisher, 
        publication_day, 
        publication_month, 
        publication_year, 
        average_rating, 
        ratings_count, 
        description,
        authors {
          id
          # author nodes here!
          # see author query for all fields
        }
        published,
        work {
          id
          uri
        }
      }
    }
  }
```

### Authors
```graphql
  allGoodreadsAuthor {
    edges {
      node {
        id
        name
        role
        image_url
        small_image_url
        link
        average_rating
        ratings_count
        text_reviews_count
        books {
          id
          # book nodes here!
          # see book query for all available fields
        }
      }
    }
  }
```

