(function() {

const electron = require('electron');
const shell = electron.shell;

  var app = angular
    .module('firebotApp', ['ngAnimate', 'ngRoute', 'ui.bootstrap']);

  app.controller('MainController', function($scope, $rootScope, boardService, connectionService, groupsService, 
    utilityService, settingsService, updatesService, eventLogService, websocketService) {

      $rootScope.showSpinner = true;

      $scope.currentTab = "Interactive";

      $scope.navExpanded = true;

      $scope.toggleNav = function() {
        $scope.navExpanded = !$scope.navExpanded;
      }

      $scope.setTab = function(tabId) {
        $scope.currentTab = tabId.toLowerCase();
      }

      $scope.tabIsSelected = function(tabId) {
        return $scope.currentTab.toLowerCase() == tabId.toLowerCase();
      }
      
      $rootScope.pasteClipboard = function(elementId, shouldUnfocus) {
        angular.element(`#${elementId}`).focus();
        document.execCommand('paste');
        if(shouldUnfocus === true || shouldUnfocus == null) {
          angular.element(`#${elementId}`).blur(); 
        }
      }

      $rootScope.openLinkExternally = function(url) {
        shell.openExternal(url);
      }    
      
      /*
      * MANAGE LOGINS MODAL
      */
      $scope.showManageLoginsModal = function() {
        var showManageLoginsModal = {
          templateUrl: "manageLoginsModal.html",
          // This is the controller to be used for the modal. 
          controllerFunc: ($scope, $uibModalInstance, connectionService) => {
            $scope.accounts = connectionService.accounts;
            
            // Login Kickoff
            $scope.loginOrLogout = function(type) {
              connectionService.loginOrLogout(type);
            }    
            
            // When the user clicks "Save", we want to pass the id back to interactiveController
            $scope.close = function() {
              $uibModalInstance.close();
            };
            
            // When they hit cancel or click outside the modal, we dont want to do anything
            $scope.dismiss = function() {
              $uibModalInstance.dismiss('cancel');
            };
          }
        }      
        utilityService.showModal(showManageLoginsModal);
      };
      
      /*
      * ABOUT FIREBOT MODAL
      */
      $scope.showAboutFirebotModal = function() {
        var addBoardModalContext = {
          templateUrl: "aboutFirebotModal.html",
          // This is the controller to be used for the modal. 
          controllerFunc: ($scope, $uibModalInstance) => {
            // The model for the board id text field
            $scope.version = electron.remote.app.getVersion();
            
            // When the user clicks "Save", we want to pass the id back to interactiveController
            $scope.close = function() {
              $uibModalInstance.close();
            };
            
            // When they hit cancel or click outside the modal, we dont want to do anything
            $scope.dismiss = function() {
              $uibModalInstance.dismiss('cancel');
            };
          },
          size: 'sm'
        }      
        utilityService.showModal(addBoardModalContext);
      };

      /**
      * Initial App Load
      */
      /**
      * Login preview stuff
      */
      $scope.accounts = connectionService.accounts;
      
      // Run loadLogin to update the UI on page load.
      connectionService.loadLogin();
      
      if(settingsService.isFirstTimeUse()) {
        utilityService.showSetupWizard();
        settingsService.setFirstTimeUse(false);
      }
      
      
      /**
      * Connection stuff
      */
      $scope.connService = connectionService;
      
      $scope.getConnectionMessage = function() {
        var message = ""
        if(connectionService.waitingForStatusChange) {
          connectionService.connectedToInteractive ? message = 'Disconnecting...' : message = 'Connecting...';
        } else {
          connectionService.connectedToInteractive ? message = 'Connected' : message = 'Disconnected';
        }
        return message;
      }
      
      // Get app version and change titlebar.
      var appVersion = electron.remote.app.getVersion();
      var version = appVersion;
      $scope.appTitle = 'Firebot Interactive || v'+version+' || @firebottletv';
      
      //Attempt to load interactive boards into memory
      if (!boardService.hasBoardsLoaded()) {
        boardService.loadAllBoards();
        $rootScope.showSpinner = false;
      }
      
      //Attempt to load viewer groups into memory
      groupsService.loadViewerGroups(); 
      
      //check for updates
      // Get update information if we havent alreday
      if(!updatesService.hasCheckedForUpdates) {
        updatesService.checkForUpdate().then((updateData) => {
          $scope.updateIsAvailable = updateData.updateIsAvailable;
        });
      }
  });

  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider

      // route for the interactive tab
      .when('/', {
        templateUrl: './templates/interactive/_interactive.html',
        controller: 'interactiveController'
      })

      // route for the viewer groups page
      .when('/groups', {
        templateUrl: './templates/_viewergroups.html',
        controller: 'groupsController'
      })
      
      // route for the moderation page
      .when('/moderation', {
        templateUrl: './templates/_moderation.html',
        controller: 'moderationController'
      })
      
      // route for the settings page
      .when('/settings', {
        templateUrl: './templates/_settings.html',
        controller: 'settingsController'
      })
      
      // route for the updates page
      .when('/updates', {
        templateUrl: './templates/_updates.html',
        controller: 'updatesController'
      })
  }]);
  
  // This adds a filter that we can use for ng-repeat, useful when we want to paginate something
  app.filter('startFrom', function() {
    return function(input, startFrom) {
      startFrom = +startFrom;
      return input.slice(startFrom);
    }
  });
})();