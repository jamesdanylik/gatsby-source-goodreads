# gatsby-source-goodreads

[![npm package](https://img.shields.io/npm/v/@jamesdanylik/gatsby-source-goodreads.svg)](https://www.npmjs.org/package/@jamesdanylik/gatsby-source-goodreads)
[![npm package](https://img.shields.io/npm/dm/@jamesdanylik/gatsby-source-goodreads.svg)](https://npmcharts.com/compare/@jamesdanylik/gatsby-source-goodreads?minimal=true)



This is a source plugin for GatsbyJS to pull information from the GoodReads API.  It is an alternative to gatsby-source-goodreads by Daniel Oliver, which predates it.  While the original pulls these books in under a single node type, the goal in my version is to grabs all the books, author, and shelf information for a single user while preserving the links between data.  

## Notes on GoodReads API Structure
Note that good reads keeps the books and ratings as seperate data objects; these reviews are what are placed on shelves, not books, and I preserve this relation to provide the most transparant access possible.  In short, your data is in the reviews nodes; data on the book itself is in the book node.

## Notes on Testing/TravisCI
This plugin originally had its own .travis.yml file.  Originally, this did the babel traspilation step and verified that no errors took place; it never was capable of testing the actually funcationality of the plugin without a GatsbyJS build process to test in.  

To improve this, I've moved testing for all my GatsbyJS source plugins to test suites in the repository for www-jamesdanylik-com.  Here, TravisCI handles building my Gatsby site, running all my source plugins; after a build is created successfully, I run test suites in Jest with Pupeteer on each of my plugins and the entire created site -- testing in this manner enables access to the complete plugin run, and allows me to ensure each of the plugins are running as expected.

TravisCI is configured to rebuild my site daily, regardless of activity, so I should detect outages fairly quickly.

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
    key: '<<YOUR GOODREADS API KEY>>',
    id: '<<USER ID TO TRACK>>'
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

