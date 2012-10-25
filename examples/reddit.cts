#siteTable {
  repeat: links;
  repeat-step: 2;
}

#siteTable div.thing p.title a.title {
  value:title;
  value(@href): link;
}

#siteTable div.thing p.title span.domain a {
  value:domain;
}

#siteTable div.unvoted div.score.unvoted {
  value:score;
}

#siteTable div.unvoted div.score.dislikes {
  value:downvotes;
}

#siteTable div.unvoted div.score.likes {
  value:upvotes;
}

#siteTable div.thing p.tagline time {
  value: relativeTime;
  value(@datetime): datetime;
}

#siteTable div.thing p.tagline a.author {
  value:author.handle;
  value(@href): author.link;
}

#siteTable div.thing p.tagline a.subreddit {
  value:category.name;
  value(@href): category.link;
}

#siteTable div.thing ul.buttons li.first a.comments {
  value:commentCount;
  value(@href): permalink;
}


