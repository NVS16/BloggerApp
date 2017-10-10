var app = angular.module("bloggingApp", [ "ui.bootstrap", "ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            redirectTo: '/console'
        })
        .when("/console", {
            templateUrl: "../html/console.html",
            controller: 'consoleController'
        })
        .when("/dashboard/home", {
            templateUrl: "../html/home.html",
            controller: 'homeController'
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
    $scope.title = "Console";
    $scope.alerts = {};
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


    $scope.Login = function() {
        $http.post('/login', $scope.login).then(function(res) {
            console.log(res);
            alert(res.data.msg);
            if(res.data.toLogin) {
                location.href = '#!/dashboard/home';
            }
        });
    };

    $scope.Signup = function() {
        console.log("Function Called");
        
            $http.post('/signup', $scope.signup).then(function(res) {
                if(res.data.errors) {
                    res.data.errors.forEach(function(obj) {
                        $scope.alerts[obj.param] = "*" + obj.msg;
                    });
                } else {
                    console.log(res.data);
                }
            });
        
    };

});

app.controller('homeController', function ($scope) {
    $scope.title = "Home";
    $scope.isNavCollapsed = true;
});

app.controller('blogsController', function ($http, $scope) {
    $scope.title = "Blogs";
    $scope.newBlog = {
        name: "",
        description: ""
    };

    $http.get('/blogs').then(function (res) {
        console.log(res);
        $scope.blogs = res.data.blogs;
    });

    $scope.submitBlog = function () {
        console.log("A POST request...");
        $http.post('/newblog', $scope.newBlog).then(function (res) {
            console.log(res);
            location.href = "#!dashboard/blogs";
        });
    };

    $scope.viewBlog = function (id) {
        console.log(id);
        location.href = "#!dashboard/blogs/posts";
        $http.post('/saveId', {
            id: id
        }).then(function (res) {
            console.log(res);
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
        comment: ""
    };


    $scope.calcData = function() {
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
            console.log(res);
            $scope.displayPost($scope.currentPost);
        });
    };


    $http.get('/posts').then(function (res) {
        console.log(res.data);
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
                $scope.displayPost($scope.currentPost);
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


});