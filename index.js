import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";
import converter from "json-2-csv";

async function getPosts() {
  // Replace "example.com" with the URL of your WordPress site
  let url = "https://lemag.promovacances.com/wp-json/wp/v2/posts";

  // Set the initial page to 1
  let page = 1;

  // Set an empty array to store the posts
  let posts = [];

  // Set a flag to indicate when all the posts have been retrieved
  let done = false;

  // Loop through the pages of results until all the posts have been retrieved
  while (!done) {
    // Send a GET request to the WordPress REST API
    const response = await fetch(`${url}?page=${page}`);
    console.log("page", page);
    // Check the response status code
    if (response.status === 200) {
      console.log("we have data ");
      // Get the response text and trim it to remove extra characters or whitespace
      const text = await response.text().then((text) => text.trim());

      try {
        // Parse the response text as JSON
        const data = JSON.parse(text);

        // If there are no posts in the response, set the done flag to true
        if (data.length === 0) {
          done = true;
        } else {
          // Add the posts to the array
          posts = [...posts, ...data];

          // Increment the page number
          page++;

          // Add a delay of 1 second between requests
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        // If the response is not valid JSON, parse it as HTML
        const $ = cheerio.load(text);
        // Extract the data you need from the HTML page
        // ...
        // Set the done flag to true
        done = true;
      }
    } else if (response.status === 404) {
      // If the server returned a 404 error, set the done flag to true
      done = true;
    } else {
      // If the server returned any other status code, throw an error
      throw new Error(`Server returned status code ${response.status}`);
    }
  }
  console.log(posts.length);
  // Write the posts to a file
  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
  converter.json2csv(posts, (err, csv) => {
    if (err) {
      throw err;
    }

    // write CSV to a file
    fs.writeFileSync("posts.csv", csv);
  });
}

// Call the getPosts function to retrieve the data
getPosts();
