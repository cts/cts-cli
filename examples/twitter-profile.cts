html { with: user; }
h1.fullname span.profile-field                { value:        name;         }
img.avatar                                    { value(@src):  imageUrl;     }
div.bio-container p.bio                       { value:        bio;          }
p.location-and-url span.location              { value:        location;     }
p.location-and-url span.url a                 { value(@href): homepageUrl;  }
a[data-element-term="tweet_stats"] strong     { value:        tweetCount;    }
a[data-element-term="following_stats"] strong { value:        followingCount;}
a[data-element-term="follower_stats"] strong  { value:        followerCount; }
ol#stream-items-id                            { repeat:       tweets;       }
ol#stream-items-id li .client-and-actions .sm-geo { value:     location; }
ol#stream-items-id li .content .js-tweet-text { value: text; }
ol#stream-items-id li .content .fullname { value: fullname; }
ol#stream-items-id li .content .username b { value: username; }

