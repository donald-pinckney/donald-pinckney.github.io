var links = document.links;

for (var i = 0, linksLength = links.length; i < linksLength; i++) {
    var type = links[i].href.split('.').pop();
    if (type == 'pdf' || links[i].href.includes("arxiv")) {
        links[i].target = '_blank';
    }
}