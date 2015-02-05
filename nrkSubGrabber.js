//Oscar Jonsson
//https://sv.gravatar.com/oggan

!function() {//self-invoking func för att inte poluta
	if (typeof jQuery == 'undefined') {//jQuery behövs. är den inte redan loadad...
		getScript('https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js', getSubtitleData);
		function getScript(url, success) {
			var script     = document.createElement('script');
			script.src = url;
			var head = document.getElementsByTagName('head')[0],
			done = false;	
			// Attach handlers for all browsers
			script.onload = script.onreadystatechange = function() {
					// callback function provided as param
					script.onload = script.onreadystatechange = null;
					head.removeChild(script);
					success();
			};
			head.appendChild(script);
		};
	} else // jQuery was already loaded
		getSubtitleData();
	function getSubtitleData() {
		var programId=jQuery("meta[name='programid']")[0];
		if (!programId) {
			return alert ("programId ikke funnet.");
		}
		
		//man kan browsa nrk's series etc på både http://tv.nrk.no och på bl.a. http://tv.nrksuper.no/ etc. Men undertexterna finns bara på det förstnämnda
		//och CORS är inte inställt på servern för http://tv.nrk.no så att det går att göra en cross-domain request från de andra sidorna.
		//Därför kollar vi först om vi är på rätt address och erbjuder annars att gå till rätt
		if (location.hostname!="tv.nrk.no") {
			if (confirm("Du er ikke på tv.nrk.no men på "+location.hostname+". Trykk OK för å ta deg till dette program på tv.nrk.no oh kjör sen denne bookmarklet igen")) {
				window.location.href=document.URL.replace(location.hostname,"tv.nrk.no");
			}
			return;
		}
		$.get("http://tv.nrk.no/programsubtitles/"+programId.content,processSubtitleData);
	}
	function processSubtitleData(data) {
		var output="";
		captions=$(data).find("div")[0].children;
		for (var i=0; i<captions.length; i++) {
			var caption=captions[i];
			var startTime=caption.getAttribute("begin");
			var endTime=secondsToTimeString(timeStringToSeconds(startTime)+timeStringToSeconds(caption.getAttribute("dur")));
			output+=i+"\r\n";
			output+=startTime.replace(".",",");
			output+=" --> ";
			output+=endTime.replace(".",",");
			output+="\r\n";
			$(caption).find('br').prepend(document.createTextNode('\r\n'));
			output+=caption.textContent;
			output+="\r\n\r\n";
		}
		download(document.title+".srt",output);
	}
	function timeStringToSeconds(timeString) {
		var time=timeString.split(/[.:]/);
		var output=parseInt(time[0])*60*60+parseInt(time[1])*60+parseInt(time[2])+parseFloat("0."+time[3]);
		return output
	}
	function secondsToTimeString(seconds) {
		var hours = parseInt(seconds / 3600 ) % 24;
		var mins = parseInt(seconds / 60 ) % 60;
		var secs = (seconds % 60).toFixed(3);
		return(hours<10?"0"+hours:hours)+":"+(mins<10?"0"+mins:mins)+":"+(seconds<10?"0"+secs:secs);
	}
	  //used by function download
	 function linkDownload(a, filename, content) {
        contentType =  'data:application/octet-stream,';
        uriContent = contentType + encodeURIComponent(content);
        a.setAttribute('href', uriContent);
        a.setAttribute('download', filename);
      }
	  //used to initate a file-download of a dyamically created file
      function download(filename, content) {
        var a = document.createElement('a');
        linkDownload(a, filename, content);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
}();