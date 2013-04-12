h1.fullname span.profile-field                { value:        user.name;         }
img.avatar                                    { value(@src):  user.imageUrl;     }
div.bio-container p.bio                       { value:        user.bio;          }
p.location-and-url span.location              { value:        user.location;     }
p.location-and-url span.url a                 { value(@href): user.homepageUrl;  }
a[data-element-term="tweet_stats"] strong     { value:        user.tweetCount;    }
a[data-element-term="following_stats"] strong { value:        user.followingCount;}
a[data-element-term="follower_stats"] strong  { value:        user.followerCount; }

