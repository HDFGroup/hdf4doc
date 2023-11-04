/* Custom setting names. Used to hook into RH settings mechanism */
var lastVisitedTopic = "cust_last_visited_topic";
var lastSideBarWidth = "cust_last_sidebar_width";
var showSidebarInCSHMode = false;
var sidebarCSHRunCheck = "cust_sidebar_csh_run_check";

var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
if(iOS && gbBlockIOSScaling) {/* Only when scaling is disabled */
	window.onorientationchange = function()
	{
	   setTimeout("window.location.reload()", 500);
	}
}
var ua = navigator.userAgent;
if( ua.indexOf("Android") >= 0 )
{
  
  var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8)); 
  if (androidversion <= 2.3)
  {
	var tmpMetaTagsList = document.getElementsByTagName('meta');
	var contentString = "user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0";
	for (i=0; i<tmpMetaTagsList.length; i++)
	{
		if (tmpMetaTagsList[i].name == "viewport")
			tmpMetaTagsList[i].content = contentString;
	}
	if(i == tmpMetaTagsList.length)
	{
		var metaTag = document.createElement('meta');
		metaTag.setAttribute("name", "viewport");
		metaTag.setAttribute("content", contentString);
		var headTags = document.getElementsByTagName('head');
		headTags[0].appendChild(metaTag);
	}
  }
}

$(function(){/* Run on DOM ready */
	/* Set global vars */
	$body = $("body");
	$sidebar = $("div.sidebar");
	$content = $("div.content");
	$sidebarButton = $("div.closebutton");
	
	/* Make the sidebar resizable */
	$sidebar.resizable({alsoResizeReverseWidth: "div.content", handles: "e", maxWidth: $body.width()*0.75});
	
	/* Check for correct content width once window is resized */
	$(window).resize(function(){
		if($sidebar.is(":visible")) {
			waitForFinalEvent(function(){
				resizePanes();
			}, 50, 'resize_content');
		} else {
			$sidebar.attr("style", "");
			$content.attr("style", "");
		}
	});
	
	/*Set localisation titles*/
	setLocalisation();
	
	/* Modify layout back to top link. RH changes the link on generation, set it correct now. */
	$("a", "div.content_top_link").attr("href", "#content_top_placeholder");
	
	/* Use RH's event scheduling service. This service makes custom script work better with RH widgets. Adding scripts on DOM ready may interfere with widget loading. */
	addRhLoadCompleteEvent(initializeLayout);
	
	/* Set Flash objects to not overflow other elements */
	$("object").each(function(){
		$(this).attr("wmode", "transparent")
			   .append('<param name="wmode" value="transparent">')
			   .append('<embed wmode="transparent" height="'+$(this).attr('height')+'" width="'+$(this).attr('width')+'">');
	});
	
});

function initializeLayout() {/* This function makes changes to the layout, including widgets. Called through RH event handler. */
	
	/* Add events to sidebar show/hide button */
	$sidebarButton.click(function(){
		showHideSidebarButton();
	});
	
	/* Add hover event to default RH widgets (RH doesn't support it out of the box)*/
	$("div.brsBack").hover(function(){hoverWidgetButton($(this), 'hover')},function(){hoverWidgetButton($(this), 'unhover')})
					.click(function(){hoverWidgetButton($(this), 'hover')});
	$("div.print").hover(function(){hoverWidgetButton($(this), 'hover')},function(){hoverWidgetButton($(this), 'unhover')});
	$("div.brsNext").hover(function(){hoverWidgetButton($(this), 'hover')},function(){hoverWidgetButton($(this), 'unhover')})
					.click(function(){hoverWidgetButton($(this), 'hover')});
	
	$("ul.wTabGroup li").hover(function(){tabButtonEvent($("ul.wTabGroup"))},function(){tabButtonEvent($("ul.wTabGroup"))})
						.click(function(){tabButtonEvent($("ul.wTabGroup"))});
	
	readSetting(lastSideBarWidth, setLastSidebarWidth, false, false);/* Load sidebar width setting */
	readSetting(lastVisitedTopic, changeTopicLink, false, false);/* Check for the latest visited topic. */
	readSetting(sidebarCSHRunCheck, setSidebarCSHRunCheck, false, false);/* Begin the CSH check for the sidebar. Only show/hide the sidebar in CSH mode the first time the help is opened. */
	
	setCheckBoxes();/* Change checkboxes into On/Off button */
	setTimeout(function(){ tabButtonEvent($("ul.wTabGroup"));/* Set images in tabs on sidebar */ }, 10);/* Set timeout because IE doesn't show the correct image directly. */
	
}
/* Layout functions */
function setLocalisation() {
	var TOCString = $("#localisation_toc").text();
	var IDXString = $("#localisation_idx").text();
	var GLOString = $("#localisation_glo").text();
	var FTSString = $("#localisation_fts").text();
	var BACKString = $("#localisation_back").text();
	
	/* Set TOC title */
	$tocBar = $("div.bar_toc");
	$tocBar.attr("title",TOCString);
	$tocBar.children().attr("title",TOCString);
	$("img", "#tocTabButton").attr("title",TOCString).attr("alt",TOCString);
	/* Set IDX title */
	$idxBar = $("div.bar_index");
	$idxBar.attr("title",IDXString);
	$idxBar.children().attr("title",IDXString);
	$("img", "#idxTabButton").attr("title",IDXString).attr("alt",IDXString);
	/* Set GLO title */
	$gloBar = $("div.bar_glossary")
	$gloBar.attr("title",GLOString);
	$gloBar.children().attr("title",GLOString);
	$("img", "#gloTabButton").attr("title",GLOString).attr("alt",GLOString);
	/* Set FTS title */
	$ftsBar = $("div.bar_search")
	$ftsBar.attr("title",FTSString);
	$ftsBar.children().attr("title",FTSString);
	/* Set BACK title */
	$topicBar = $("div.bar_topic");
	$topicBar.attr("title",BACKString);
	$topicBar.children().attr("title",BACKString);
}
function resizePanes() {/* Make sidebar resizable on desktop */
	/* Reset maximum sidebar width */
	$sidebar.resizable({maxWidth: $body.width()*0.75, minWidth: Math.round($body.width()/100)});
	
	/* Make sure that whole page is filled. */
	var bodyWidth = $body.width();
	var sidebarWidth = $sidebar.width();
	var contentWidth = $content.width();
	
	if(bodyWidth != sidebarWidth+contentWidth) {
		
		if(sidebarWidth > bodyWidth) {
			$sidebar.width(Math.round(bodyWidth*0.75));
			$content.width(bodyWidth-$sidebar.width());
		} else {
			$content.width(bodyWidth-sidebarWidth);
		}
		
	}
	saveSidebarWidth(sidebarWidth);
	setSidebarButtonStyle();
}
function showHideSidebarButton() {/* Add actions to sidebar button */
	var sidebarWidth = $sidebar.width();
	var resizerWidth = $(".ui-resizable-e", $sidebar).width();
	if(sidebarWidth-resizerWidth <= resizerWidth*2) {
		$sidebar.width($body.width()*0.22);
	} else {
		$sidebar.width(Math.round($(".ui-resizable-e", $sidebar).width()*2));
	}
	
	resizePanes()
}
function setSidebarButtonStyle() {/* Set correct CSS style for the sidebar show/hide button */
	var visibleStyle = "buttonOpened";
	var hiddenStyle = "buttonClosed";
	
	var sidebarWidth = $sidebar.width();
	var resizerWidth = $(".ui-resizable-e", $sidebar).width();
	if(sidebarWidth-resizerWidth <= resizerWidth*2) {
		$sidebarButton.addClass(hiddenStyle);
		$sidebarButton.removeClass(visibleStyle);
	} else {
		$sidebarButton.removeClass(hiddenStyle);
		$sidebarButton.addClass(visibleStyle);
	}
}
function saveSidebarWidth(width) {
	saveSetting(lastSideBarWidth, width, false);
}
function setLastSidebarWidth(width, arg1, arg2) {
	if(width != "" && $sidebar.is(":visible")) {
		$sidebar.width(width);
		resizePanes();
	}
}
function setSidebarCSHRunCheck(alreadyrunning, a, b) {
	if(alreadyrunning == "") {
		saveSetting(sidebarCSHRunCheck, 'already_running', false);
		readSetting(RHCSHMODE, sidebarCSHCall);
	}
}
function sidebarCSHCall(cshmode, a, b) {/* Auto hide sidebar in CSH call */
	if(cshmode == CSHMODE) {
		if(showSidebarInCSHMode === false) {
			showHideSidebarButton()
		}
	}
}
function tabButtonEvent(tabs) {
	$("li", tabs).each(function(){
		var img = $("img.normal", $(this));

		if($(this).attr("class") == "wTab") {
			hoverWidgetButton($(this), 'unhover');
		} else {
			hoverWidgetButton($(this), 'hover');
		}
	});
}
function hoverWidgetButton(element, action) {
	$hover = $("img.hover", element);
	$normal = $("img.normal", element);
	switch(action) {
		case 'hover':
				$hover.show();
				$normal.hide();
			break;
		case 'unhover':
				$normal.show();
				$hover.hide();
			break;s
	}
}
/* Remember last visited topic */
function setTopic() {
	saveSetting(lastVisitedTopic, document.location.toString(), false);/* Save the URL of the topic. */
}
function changeTopicLink(url, arg1, arg2) {/* Amend return link. Change default topic to last visited topic. */
	if(url != "") {
		$("a.back_to_last_topic").attr("href", url);
	}
}
//Turn checkboxes to on/off switches on Run
function setCheckBoxes() {
	/* 
		Credit for On/Off switch logic: http://blog.dbrgn.ch/2011/11/21/jquery-checkbox-on-off-toggleswitch/
		
		Method is shared under Creative Commons license Attribution-ShareAlike 3.0 Unported - http://creativecommons.org/licenses/by-sa/3.0/
		
	*/
	$('.switch').each(function() {
		var checkbox = $(this).children('input[type=checkbox]');
		var toggle = $(this).children('label.switch-toggle');
		if (checkbox.length) {
			
			checkbox.addClass('hidden');
			toggle.removeClass('hidden');
			
			if (checkbox[0].checked) {
				toggle.addClass('on');
				toggle.removeClass('off');
				toggle.text(toggle.attr('data-on'));
			} else { 
				toggle.addClass('off');
				toggle.removeClass('on');
				toggle.text(toggle.attr('data-off'));
			};
		}
	});
	$('.switch-toggle').click(function(){
		
		var checkbox = $(this).siblings('input[type=checkbox]')[0];
		var toggle = $(this); 
		
		if (checkbox.checked) {
			toggle.addClass('off');
			toggle.removeClass('on');
			toggle.text(toggle.attr('data-off'));
		} else {
			toggle.addClass('on');
			toggle.removeClass('off');
			toggle.text(toggle.attr('data-on'));
		}
	});
}
/* Helpers */
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      //Ignore
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();
/* Custom plugin for jqueryui */
$.ui.plugin.add("resizable", "alsoResizeReverseWidth", {

	start: function () {
		var that = $(this).data("ui-resizable"),
			o = that.options,
			_store = function (exp) {
				$(exp).each(function() {
					var el = $(this);
					el.data("ui-resizable-alsoresize-reverse", {
						width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
						left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
					});
				});
			};

		if (typeof(o.alsoResizeReverseWidth) === "object" && !o.alsoResizeReverseWidth.parentNode) {
			if (o.alsoResizeReverseWidth.length) { o.alsoResizeReverseWidth = o.alsoResizeReverseWidth[0]; _store(o.alsoResizeReverseWidth); }
			else { $.each(o.alsoResizeReverseWidth, function (exp) { _store(exp); }); }
		}else{
			_store(o.alsoResizeReverseWidth);
		}
	},

	resize: function (event, ui) {
		
		var that = $(this).data("ui-resizable"),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: (that.size.height - os.height) || 0, width: (that.size.width - os.width) || 0,
				top: (that.position.top - op.top) || 0, left: (that.position.left - op.left) || 0
			},

			_alsoResizeReverseWidth = function (exp, c) {
				$(exp).each(function() {
					var el = $(this), start = $(this).data("ui-resizable-alsoresize-reverse"), style = {},
						/* Only resize the width of the element. */
						//css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
						css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? ["width"] : ["width", "left"];

					$.each(css, function (i, prop) {
						var sum = (start[prop]||0) - (delta[prop]||0);
						if (sum && sum >= 0) {
							style[prop] = sum || null;
						}
					});

					el.css(style);
				});
			};

		if (typeof(o.alsoResizeReverseWidth) === "object" && !o.alsoResizeReverseWidth.nodeType) {
			$.each(o.alsoResizeReverseWidth, function (exp, c) { _alsoResizeReverseWidth(exp, c); });
		}else{
			_alsoResizeReverseWidth(o.alsoResizeReverseWidth);
		}
	},

	stop: function () {
		$(this).removeData("resizable-alsoresize-reverse");
	}
});
