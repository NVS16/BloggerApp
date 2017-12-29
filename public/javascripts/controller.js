var app = angular.module("bloggingApp", [ "ui.bootstrap", "ngRoute", "ngSanitize"]);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            redirectTo: '/console'
        })
        .when("/console", {
            templateUrl: "../html/console.html",
            controller: 'consoleController'
        })
        .when("/dashboard/categories", {
            templateUrl: "../html/categories.html",
            controller: 'catsController'
        })
        .when("/dashboard/categories/:cat/:blog?/:post?", {
            templateUrl: '../html/blogposts.html',
            controller: 'blogPostsController'
        })
        .when("/dashboard/blogs", {
            templateUrl: "../html/blogs.html",
            controller: 'blogsController'
        })
        .when("/dashboard/blogs/posts", {
            templateUrl: "../html/posts.html",
            controller: 'postsController'
        });

})


app.controller('consoleController', function($scope, $http) {
    $scope.loading = false;
    $scope.title = "Console";
    $scope.alerts = {};
    $scope.alertsLogin = {};
    $scope.signup = {
        name: "",
        contact: "",
        dob: "",
        email: "",
        password: "",
        passwordConfirm: ""
    };
    $scope.login = {
        email: "",
        password: ""
    };

    $scope.eraseAlert = function(prop) {
        $scope.alerts[prop] = "";
    };

    $scope.eraseAlertLogin = function(prop) {
        $scope.alertsLogin[prop] = "";
    };

    $http.get('/checksession').then(function(res) {
        console.log(res);
        if(res.data.isLoggedIn)
            location.href = '#!/dashboard/categories';
    });


    $scope.Login = function() {
        $scope.loading = true;
        $http.post('/login', $scope.login).then(function(res) {
            console.log(res);
            $scope.loading = false;
            if(res.data.errors) {
                res.data.errors.forEach(function(obj) {
                    $scope.alertsLogin[obj.param] = "*" + obj.msg;
                });
            } else {
                if(res.data.toLogin) {
                    location.href = '#!/dashboard/categories';
                } else {
                    alert(res.data.msg);
                    $scope.login.email = "";
                    $scope.login.password = "";
                }
            }
        });
    };

    $scope.Signup = function() {
        console.log("Function Called");
            $scope.loading = true;
            $http.post('/signup', $scope.signup).then(function(res) {
                $scope.loading = false;
                if(res.data.errors) {
                    res.data.errors.forEach(function(obj) {
                        $scope.alerts[obj.param] = "*" + obj.msg;
                    });
                } else {
                    console.log(res.data);
                    alert("Successfully Registered!");
                    location.href = "#!console";
                }
            });
        
    };

});

app.controller('catsController', function ($scope, $http) {
    $scope.title = "Categories";
    $scope.isNavCollapsed = true;
    $scope.loading = false;
    $scope.searchDetails = {
        query: "",
        results: [ ]
    };

    $http.get('/checksession').then(function(res) {
        console.log(res);
        if(!res.data.isLoggedIn)
            $scope.logOut();
    });
/*
    $scope.calcData = function() {
        $scope.searchDetails.results.forEach(function(result, indexA) {
            if(!result.blogs) {
                $scope.searchDetails.results[indexA].blogCount = 0;
                $scope.searchDetails.results[indexA].viewCount = 0;
                $scope.searchDetails.results[indexA].voteCount = 0;
                $scope.searchDetails.results[indexA].commentCount = 0;
            } else {
                $scope.searchDetails.results[indexA].blogCount = result.blogs.length;
                $scope.searchDetails.results[indexA].blogs.forEach(function(blog, indexB) {
                    $scope.searchDetails.results[indexA].postCount += blog.posts.length;
                    $scope.searchDetails.results[indexA].blogs[indexB].posts.forEach(function(reviews, indexC) {
                        $scope.searchDetails.results[indexA].viewCount += reviews.views.length;
                        $scope.searchDetails.results[indexA].voteCount += reviews.votes.length;
                        $scope.searchDetails.results[indexA].commentCount += reviews.comments.length; 
                    });
                });
            }
        });
        console.log($scope.searchDetails.results);
    };
*/
    $scope.cats = [ {name: "Science and Technology", img: "../images/0.jpeg"}, { name:  "Education", img: "../images/1.jpg"},
    { name: "Sports", img: "../images/2.jpg"},
    {name: "Food and Travel", img: "../images/4.jpg"},{ name: "Art and Architecture", img: "../images/5.jpg"},
    {name: "Creative", img: "../images/6.png"},
    {name: "Health and Fitness", img: "../images/7.jpg"},{ name: "Spiritual", img: "../images/8.jpg"} , 
    {name: "Miscellaneous", img: "../images/3.jpg"} ];

    $scope.getBlogPosts = function(cat) {
        $scope.loading = true;
        location.href = "#!dashboard/categories/" + cat;
    };

    $scope.logOut = function() {
        $scope.loading = true;
        $http.get('/logout').then(function(res) {
            console.log(res);
            $scope.loading = false;
            location.href = "#!console";
        });
    };
});

app.controller('blogPostsController', function($http, $scope, $routeParams) {
    $scope.posts = [];
    $scope.noPosts = false;
    $scope.loading = false;
    $scope.commentDetails = {
        comment: "",
        id: ""
    };

    $http.get('/checksession').then(function(res) {
        console.log(res);
        if(!res.data.isLoggedIn)
            $scope.logOut();
    });
    
    console.log($routeParams.cat);
    if($routeParams.blog === undefined) {
        $scope.showCurrent = false;
        $http.get('/getblogposts/' + $routeParams.cat)
            .then(function(res) {
                console.log(res);
                if(res.data.length === 0) {
                    $scope.noPosts = true;
                } else {
                    res.data.forEach(function(blog) {
                        blog.posts.forEach(function(post) {
                            post.blogId = blog._id;
                            post.blogName = blog.name;
                            post.blogAuthor = blog.user.name;
                            post.body = post.body.slice(0, 200);
                            $scope.posts.push(post);
                        });
                    });
                }
            });
    } else {
        $scope.showCurrent = true;
        console.log($routeParams.blog + '---' + $routeParams.post);
        $http.get('/getblogposts/' + $routeParams.cat + '/' + $routeParams.blog + '/' + $routeParams.post)
            .then(function(res) {
                console.log(res);
                $scope.currentPost = res.data.post;
                $scope.commentDetails.id = $scope.currentPost.reviews._id;
                $scope.currentPost.blogName = res.data.blog.name;
                $scope.currentPost.author = res.data.blog.user.name;
                $scope.currentPost.upCount = $scope.currentPost.downCount = 0;
                $scope.currentPost.viewCount = $scope.currentPost.reviews.views.length;
                $scope.currentPost.reviews.votes.forEach(function(voteDetail, index) {
                    console.log(voteDetail);
                    if( voteDetail.vote === "upvote" ) {
                        $scope.currentPost.upCount += 1;
                    } else {
                        $scope.currentPost.downCount+= 1;
                    }
                });
            });
    }

        $scope.close = function() {
            $scope.loading = true;            
            location.href = "#!dashboard/categories/" + $routeParams.cat;
        };

        $scope.expand = function(names) {
            $scope.loading = true;
            var params = names.split('---');
            $http.post('/blogpostsviews',{ blog: params[0], post: params[1] })
            .then(function(res) {
                console.log(res);
                $scope.loading = false;
                location.href = "#!dashboard/categories/" + $routeParams.cat + '/' + params[0] + '/' + params[1];                
            });
        };

        $scope.submitComment = function () {
            $scope.loading = true;            
            if ($scope.commentDetails.comment === "") {
                alert("Form field empty...");
            } else {
                $http.post('/newcomment', $scope.commentDetails)
                .then(function (res) {
                    $scope.loading = false;                    
                    console.log(res);
                    $scope.commentDetails.comment = "";
                    $scope.currentPost.reviews.comments = res.data.comments;
                });
            }
            
        };
    
        $scope.vote = function(vote) {
            $scope.loading = true;            
            $http.post('/vote', { id: $scope.currentPost.reviews._id, vote: vote }).then(function(res) {
                $scope.loading = false;
                console.log(res.data);
                //$scope.displayPost($scope.currentPost);
                if(res.data.updated) {
                    
                        if( vote === "upvote" ) {
                            $scope.currentPost.upCount += 1;
                            $scope.currentPost.downCount -= 1;
                        } else {
                            $scope.currentPost.downCount += 1;
                            $scope.currentPost.upCount -= 1;
                        }
                    
                } else if(res.data.isMatch) {
                    console.log("Nothing to change!");
                } else {
                    if( vote === "upvote" ) {
                        $scope.currentPost.upCount += 1;
                    } else {
                        $scope.currentPost.downCount += 1;
                    }
                }
    
            });  
        };

        $scope.logOut = function() {
            $scope.loading = true;
            $http.get('/logout').then(function(res) {
                console.log(res);
                $scope.loading = false;
                location.href = "#!console";
            });
        };
    });

app.controller('blogsController', function ($http, $scope) {
    $scope.title = "Blogs";
    $scope.loading = true;    
    $scope.newBlog = {
        name: "",
        description: "",
        category: "Science and Technology"
    };

    $http.get('/blogs').then(function (res) {
        $scope.loading = false;        
        console.log(res);
        if(!res.data)
            location.href = "#!console";
        $scope.blogs = res.data;
    });

    $scope.submitBlog = function () {
        $scope.loading = true;        
        console.log("A POST request...");
        $http.post('/newblog', $scope.newBlog).then(function (res) {
            console.log(res);
            $scope.loading = false;            
            location.href = "#!dashboard/blogs";
        });
    };      

    $scope.viewBlog = function (id) {
        console.log(id);
        $scope.loading = true;        
        location.href = "#!dashboard/blogs/posts";
        $http.post('/saveId', {
            id: id
        }).then(function (res) {
            console.log(res);
            $scope.loading = false;            
        });
    };

    $scope.logOut = function() {
        $scope.loading = true;
        $http.get('/logout').then(function(res) {
            console.log(res);
            $scope.loading = false;
            location.href = "#!console";
        });
    };
});

app.controller('postsController', function ($scope, $http) {
    $scope.currStars = 0;
    $scope.postIDs = [];
    $scope.name = "John Doe";
    $scope.currentPost = [];
    $scope.newPost = true;
    $scope.newPostContent = {
        title: "",
        body: ""
    };
    $scope.commentDetails = {
        comment: "",
        id: ""
    };


    $scope.calcData = function() {
        $scope.commentDetails.id = $scope.currentPost.reviews._id;
        $scope.currentPost.views = 0;
        $scope.currentPost.upvotes = 0;
        $scope.currentPost.downvotes = 0;
        console.log("Calc Data");
        $scope.currentPost.views = $scope.currentPost.reviews.views.length;
        $scope.currentPost.reviews.votes.forEach(function(voteDetail) {
            console.log(voteDetail);
            if( voteDetail.vote === "upvote" ) {
                $scope.currentPost.upvotes += 1;
            } else {
                $scope.currentPost.downvotes += 1;
            }
        });
    };

    $scope.vote = function(vote) {
        $http.post('/vote', { id: $scope.currentPost.reviews._id, vote: vote }).then(function(res) {
            console.log(res.data);
            //$scope.displayPost($scope.currentPost);
            if(res.data.updated) {
                
                    if( vote === "upvote" ) {
                        $scope.currentPost.upvotes += 1;
                        $scope.currentPost.downvotes -= 1;
                    } else {
                        $scope.currentPost.downvotes += 1;
                        $scope.currentPost.upvotes -= 1;
                    }
                
            } else if(res.data.isMatch) {
                console.log("Nothing to change!");
            } else {
                if( vote === "upvote" ) {
                    $scope.currentPost.upvotes += 1;
                } else {
                    $scope.currentPost.downvotes += 1;
                }
            }

        });  
    };


    $http.get('/posts').then(function (res) {
        console.log(res.data);
        if(!res.data)
            location.href = "#!console";
        $scope.postIDs = res.data.posts;
    });


    $scope.displayPost = function (post) {
        if($scope.newPost) {
            $scope.newPost = false;
        }
        console.log(post);
        $scope.currentPost = post;
        $http.get('/posts/' + post._id).then(function (res) {
            console.log(res.data);
            $scope.currentPost = res.data;
            angular.element(document.querySelector('.currentPostBody')).html($scope.currentPost.body);
            $scope.calcData();
        });
    }
 


    $scope.submitComment = function () {
        if ($scope.commentDetails.comment === "") {
            alert("Form field empty...");
        } else {
            $http.post('/newcomment', $scope.commentDetails)
            .then(function (res) {
                console.log(res);
                $scope.commentDetails.comment = "";
                $scope.currentPost.reviews = res.data;
            });
        }
        
    };

    $scope.toggleNewPost = function() {
        if(!$scope.newPost) {
            $scope.newPost = !$scope.newPost;
            $scope.currentPost = [];
        }
    };

    $scope.submitPost = function() {
        if(($scope.newPostContent.title === "") || ($scope.newPostContent.body === "")) {
            alert("Either form field empty!!");
        } else {
            $http.post('/newpost', $scope.newPostContent).then(function(res) {
                console.log(res.data);
                location.href = "#!dashboard/blogs/posts";
            });
        }
    };

    $scope.logOut = function() {
        $scope.loading = true;
        $http.get('/logout').then(function(res) {
            console.log(res);
            $scope.loading = false;
            location.href = "#!console";
        });
    };

});