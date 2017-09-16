angular.module('gallery', ['ngRoute'])
    .config([
        '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $routeProvider
                .when('/Marshmellows/gallery', {
                    templateUrl: '/views/home/gallery.html',
                    controller: 'GalleryController'
                })
                .when('/Marshmellows/main', {
                    templateUrl: '/views/home/main.html',
                    controller: 'aboutUsController'
                })
                .when('/Marshmellows/addNewImage', {
                    templateUrl: '/views/home/addNewImage.html',
                    controller: 'AddNewImgController'
                })
                .otherwise({
                    redirectTo: '/Marshmellows/gallery'
                });

            $locationProvider.html5Mode(true);
        }
    ])
    .controller('GalleryController', [
        '$scope', 'dataCenter', function($scope, dataCenter) {

            $scope.remove = function (url) {
                dataCenter.remove(url);
                /*$route.reload();
                location.href=location.href;
                location.reload();*/
                document.location.href = "http://localhost:50368/";
                /*document.location.replace("http://www.site.ru");*/
            }

            var defered = dataCenter.getAll();
            defered.then(function(response) {
                $scope.Images = response.data;
            });
            
            var a = 123;

    	    $scope.extensionsArray = [
                {
                    extensionChecker: /\.(jpeg|jpg)$/i,
                    name: 'jpg'
                },
                {
                    extensionChecker: /\.png$/i,
                    name: 'png'
                },
                {
                    extensionChecker: /\.(gif|tiff|bmp)$/i,
                    name: 'Остальное'
                }
    	    ];
            
            $scope.getNumber = function (num) {
                return new Array(num);
            };
            
    	    $scope.filterByExtension = function (img) {
    	        const selectedExtensions = $scope.extensionsArray.filter(extension => extension.isChecked);
    	        if (selectedExtensions.length) {
    	            return selectedExtensions.some(extension => {
    	                return extension.extensionChecker.test(img.Url);
    	            });
    	        } else {
    	            return true;
    	        }
    	    };
            
    	    $scope.toggleTooltip = function () {

    	        event.stopPropagation();
    	        this.showtooltipLeft = !$scope.showtooltipLeft;

    	        $scope.hideTooltip = function () {
    	           this.showtooltipLeft = false;
    	        }
    	    }
    	     	   

    	    $scope.showFullImage = function (imageSrc) {
    	        var imageElement = document.createElement('img');
    	        imageElement.src = imageSrc;
    
    	        var backdrop = document.createElement('div');
    	        backdrop.classList.add('modal-backdrop');
    	        backdrop.appendChild(imageElement);
    
    	        document.body.appendChild(backdrop);
    	        backdrop.addEventListener('click', function () {
        	            document.body.removeChild(backdrop);
        	        });
    	    };
    	}])


	.controller('aboutUsController', ['$scope', function ($scope) {
        Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
	}])

	.controller('AddNewImgController', ['$scope', 'dataCenter', function ($scope, dataCenter) {
        
        $scope.newImgRate = {};
	    $scope.arrayOfRates = [1, 2, 3, 4, 5];
	    $scope.img = {};
        
	    $scope.addImg = function() {
            dataCenter.add($scope.img.name, $scope.img.data, $scope.img.star);
            $scope.img = {};
            //document.location.href = "http://localhost:50368/";
	    } 
	}])

    .service('dataCenter', ['$http', function($http) {
        return {
            getAll: getAll,
            add: add,
            remove: remove
        };

        function getAll() {
            return $http({
                url: 'http://localhost:50368/Image/GetImage'
            });
        };

        function add(fileName, data, star) {
            var response = $http({
                method: 'POST',
                url: 'http://localhost:50368/Image/AddImgAjax',
                data: {
                    fileName: fileName,
                    data: data,
                    star: star
                },
                headers: { 'Accept': 'application/json' }
            });
            return response;
        };

        function remove(url) {
            return $http({
                method: 'POST',
                url: 'http://localhost:50368/Image/RemoveImage',
                data: {
                    url: url
                },
                headers: { 'Accept': 'application/json' }
            });
        }

        }
    ])
    .directive("fileread", [
        function() {
            return {
                scope: {
                    fileread: "="
                },
                link: function(scope, elemet, attributes) {
                    elemet.bind("change", function(changeEvent) {
                        var reader = new FileReader();
                        reader.onload = function(loadEvent) {
                            scope.$apply(function() {
                                scope.fileread = loadEvent.target.result;
                            });
                        }
                        reader.readAsDataURL(changeEvent.target.files[0]);
                    });
                }
            }
        }
    ]);;



