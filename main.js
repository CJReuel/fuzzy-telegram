const myKey = config.YOUTUBE_API_KEY;
      // Get references to DOM elements we need to manipulate
      const searchTerm = document.querySelector('#search');
      const searchForm = document.querySelector('#searchForm');
      const submitBtn = document.querySelector('#submit');
      const loadingElement = document.querySelector('#loading');
      const videosElement = document.querySelector('#videos');
      const favs = document.querySelector('#favs');
      const displayFavs = document.querySelector('#displayF');
      let favVideos = JSON.parse(localStorage.getItem("favs") || "[]");
      addFavsToDom(favVideos);

      //load API

      window.onload = onClientLoad;
      function onClientLoad() {
        gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
      }

      function onYouTubeApiLoad() {
        gapi.client.setApiKey(myKey);
        searchForm.addEventListener('submit', search);
      }

      //get Search Results:

      function search(e) {
        e.preventDefault();
        let searchBy= document.querySelector('input[name="optionsRadios"]:checked').value;
        let request = gapi.client.youtube.search.list({
          part: 'snippet',
          maxResults: 10,
          q: searchTerm.value,
          order: searchBy,
          type: 'video',
          videoDuration: 'medium'
        });
        request.execute(onSearchResponse);
      }

      //add To DOM:

      function onSearchResponse(response) {
        let results = response.items;
        clearTheSpace();
        showVideos(results);
      }

      function clearTheSpace(){
        loadingElement.style.display = 'none';
        while (videosElement.firstChild) {
          videosElement.removeChild(videosElement.firstChild);
        }
      } 
      
      function showVideos(videos) {

        videos.forEach((video) => {
          const idVideo = video.id.videoId;
          
          //create new elements:

          const colDiv = document.createElement('div');
          
          const link = document.createElement('a');
          link.setAttribute('target', '_blank');
          link.href = `https://www.youtube.com/watch?v=${idVideo}`;
          
          const videoElement = document.createElement('div');
          const mediaBody = document.createElement('div');
          
          const h5 = document.createElement('h5');
          h5.textContent = video.snippet.title;
          
          const dateTime = document.createElement('P');
          dateTime.textContent = video.snippet.publishedAt;
          
          const channelTitle = document.createElement('P');
          channelTitle.textContent = video.snippet.channelTitle;     

          //fav buttons & behaviour:

          const favButton = document.createElement('button');
          favButton.id = `f${idVideo}`;
          favButton.className = 'btn btn-outline-primary';
          favButton.textContent = 'Add to Favorites';

          const removeBut = document.createElement('button');
          removeBut.id = idVideo;
          removeBut.className = 'btn btn-outline-primary';
          removeBut.textContent = 'Remove from Favorites';
          removeBut.style.display = 'none';

          removeBut.addEventListener("click", function(){
            favVideos.splice( favVideos.findIndex(equalsVideoId), 1 );
            favButtonReset(favButton,removeBut);
            favDisplayReset();
          });

          favButton.addEventListener("click", function(){
           favVideos.push(video);
           favButtonReset(removeBut,favButton);
           favDisplayReset();
          });

          favVideos.forEach((favorite) => {
            if(favorite.id.videoId === idVideo){
              favButtonReset(removeBut,favButton);  
            } 
          });

          favVideos.findIndex(equalsVideoId);
          function equalsVideoId(element) {
            return element.id.videoId === idVideo;
          }

          //video player:

          addVideos(idVideo, mediaBody);
          
          //video metaInfo:  

          const videoDetailsURL = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${video.id.videoId}&key=${myKey}`
          const getDetails = fetch(videoDetailsURL)
          .then(response => response.json())
          .then(showvideoDetails);   
          const videoMetadata = document.createElement('P');

          function showvideoDetails(videoDetails) {
            videoMetadata.textContent = `VIEW COUNT:${videoDetails.items[0].statistics.viewCount} 
            LIKES:${videoDetails.items[0].statistics.likeCount} 
            DISLIKES:${videoDetails.items[0].statistics.dislikeCount} 
            FAVORITES:${videoDetails.items[0].statistics.favoriteCount} 
            COMMENTS:${videoDetails.items[0].statistics.commentCount}`                
          }

          //add elements to DOM:

          videoElement.appendChild(link);
          videoElement.appendChild(mediaBody);
          link.appendChild(h5);
          mediaBody.appendChild(favButton);
          mediaBody.appendChild(removeBut);
          mediaBody.appendChild(channelTitle);
          mediaBody.appendChild(dateTime);
          colDiv.appendChild(videoElement);
          videosElement.appendChild(colDiv);
          mediaBody.appendChild(videoMetadata);
          
          //css styles:

          colDiv.className = 'col-xs-1 col-sm-6 col-md-4 video';
          videoElement.className = 'card ma-1';
          mediaBody.className = 'card-body';
          h5.className = 'card-title';
          dateTime.className = 'card-text';
          channelTitle.className = 'card-text';
        });
      }

      function favDisplayReset(){
        localStorage.setItem('favs', JSON.stringify(favVideos));
        while (displayFavs.firstChild) {
          displayFavs.removeChild(displayFavs.firstChild)
        }
        addFavsToDom(favVideos);
      }

      function favButtonReset(enabled,disabled){
        disabled.style.display = 'none';
        enabled.style.display = 'unset';
      }

      function addVideos(idVideo, parent){
        const vid = document.createElement('iframe');
        vid.width='100%';
        vid.height='100%';
        vid.src=`https://www.youtube.com/embed/${idVideo}`;
        vid.frameborder='0';
        vid.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        vid.setAttribute('allowfullscreen','allowfullscreen');
        parent.appendChild(vid);
      }

        //adding favorite bar on right to DOM:

        function addFavsToDom(favVideos){
          favVideos.forEach((favorite)=> {
            const favId = favorite.id.videoId;
            const favDiv = document.createElement('div');

            const link = document.createElement('a');
            link.setAttribute('target', '_blank');
            link.href = `https://www.youtube.com/watch?v=${favId}`;

            const h6 = document.createElement('h6');
            h6.textContent = favorite.snippet.title;

            addVideos(favId, h6);
            
            const butDiv = document.createElement('div');
            const removeBut = document.createElement('button');
            removeBut.className = 'btn btn-outline-secondary';
            removeBut.textContent = 'Remove from Favorites';

            removeBut.addEventListener("click", function(){
              favVideos.splice( favVideos.findIndex(equalsVideoId), 1 );
              favDisplayReset();
              
              const linkedReBut = document.getElementById(favId);
              const linkedFavBut = document.getElementById(`f${favId}`);

              if (linkedFavBut !== null){
                linkedFavBut.style.display = 'unset';
                linkedReBut.style.display = 'none';
              }

              function equalsVideoId(element) {
                return element.id.videoId === favId;
              }

            });

            displayFavs.appendChild(favDiv);
            favDiv.appendChild(link);
            link.appendChild(h6);
            displayFavs.appendChild(butDiv);
            butDiv.appendChild(removeBut);  
          });
        }