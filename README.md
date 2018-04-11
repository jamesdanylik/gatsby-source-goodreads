# gatsby-source-goodreads

[![Build Status](https://travis-ci.org/jamesdanylik/gatsby-source-goodreads.svg?branch=master)](https://travis-ci.org/jamesdanylik/gatsby-source-goodreads)

[![npm package](https://img.shields.io/npm/v/@jamesdanylik/gatsby-source-goodreads.svg)](https://www.npmjs.org/package/@jamesdanylik/gatsby-source-goodreads.svg)

[![npm package](https://img.shields.io/npm/dm/@jamesdanylik/gatsby-source-goodreads.svg)](https://npmcharts.com/compare/@jamesdanylik/gatsby-source-goodreads?minimal=true)



This is a source plugin for GatsbyJS to pull information from the GoodReads API.  It is an alternative to gatsby-source-goodreads by Daniel Oliver, which predates it.  While the original pulls these books in under a single node type, the goal in my version is to grabs all the books, author, and shelf information for a single user while preserving the links between data.  

## Notes on GoodReads API Structure
Note that good reads keeps the books and ratings as seperate data objects; these reviews are what are placed on shelves, not books, and I preserve this relation to provide the most transparant access possible.  In short, your data is in the reviews nodes; data on the book itself is in the book node.

## **WARNING**
This plugin is in pre-release status!  **It currently only provides the first 200 reviews for a user**; retrieving more is still a work-in-progress.  Check back soon, file a pull request, or just use at your own risk until this warning is removed!

## Install

```bash
npm install --save @jamesdanylik/gatsby-source-goodreads
```


## Configuration
```javascript
// In your gatsby-config.js
plugins: [
	{
	      resolve: "@jamesdanylik/gatsby-source-goodreads",
	      options: {
            api_key: '<<YOUR GOODREADS API KEY>>'
	        user_id: '<<USER ID TO TRACK>>'
	      },
	},
	...
]
```

## Provided Queries

### Reviews
```graphql
  allGoodreadsReview {
    edges {
      node {
        id
        rating
        votes
        spoiler_flag
        spoilers_state
        recommended_by
        recommended_for
        started_at
        read_at
        date_added
        date_updated
        read_count
        body
        comments_count
        url
        link
        owned
        book {
          id
          # book node here!
          # see book query for all fields
        }
        shelves {
          id
          # shelf nodes here!
          # see shelf query for all fields
        }
      }
    }
  }
  
```

### Shelves
```graphql
  allGoodreadsShelf {
    edges {
      node {
        id
        name
        exclusive
        review_shelf_id
        reviews {
          id
          # reviews nodes here!
          # see review query for all fields
        }
      }
    }
  }
```

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
        published,
        work {
          id
          uri
        }
        authors {
          id
          # author nodes here!
          # see author query for all fields
        }
        reviews {
          id
          # review nodes here!
          # see review query for all fields
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

