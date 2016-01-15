# VAST2HTML5
### Play VAST ads on HTML5 Video


## Use
  * Add the tag video to your HTML. Assign width, height and ID.

        <video id="video" width="640" height="360" controls autoplay>
          Your browser does not support the video tag.
        </video>

  * Enter the code and call the function in your javascript.

        vast2html5(*ad-url*, *video-tag-id*);


## Javascript

 * The code is commented, the only dependency is the lib [Popcorn.js](http://popcornjs.org/) (Still I'll work on it)

* Order logic:
    1. GET on the URL and retrieves the data with *responseXML*;
    2. Creates a new object with the retrieved data;
    3. Create new source elements according to the size of the video tag.