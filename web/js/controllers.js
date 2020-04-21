'use strict';

/* Controllers */

angular.module('qcmffvl.controllers', [])

.controller('LoadCtrl', function($scope, $routeParams) {
    $scope.$parent.loadQCMID($routeParams.qcmid);
    if ($routeParams.typeExamNum) {
        $scope.$parent.main.typeExam.checked = $scope.$parent.main.typeExam.options[$routeParams.typeExamNum]
    }
})



.controller('SelfTestCtrl', function($scope, API) {
    $scope.$parent.loading = false;
    /* 
    TODO : 
        generate N QCMs (1000 ?)
        for  every setup (cat/level), show :
            - the avg place of each question
            - the percentage of question hitting top 30 and 60
    */
})

.controller('AboutCtrl', function($scope) {
    $scope.$parent.navCollapsed = true;
    $scope.$parent.loading = false;
    $scope.$parent.hideNavbarButtons = true;

    document.body.scrollTop = document.documentElement.scrollTop = 0;
})

.controller('QCMIDDialogCtrl', function($scope, $modalInstance, $location, data, API) {
    $scope.main = data;

    $scope.savedFormattedQCMIDUser = angular.copy($scope.main.formattedQCMIDUser);
    $scope.verifyQCMIDUser = function() {
        if ($scope.main.formattedQCMIDUser != $scope.savedFormattedQCMIDUser) {
            return API.verifyChecksum($scope.main.QCMIDUser);
        } else {
            return true;
        }
    }
    $scope.QCMIDBlur = function() {
        if (!$scope.verifyQCMIDUser())
            $scope.main.formattedQCMIDUser = angular.copy($scope.savedFormattedQCMIDUser);
    }
    $scope.loadQCMID = function() {
        $modalInstance.close();
    }
    $scope.ok = function() {
        $modalInstance.dismiss();
    }
})

.run(function($templateCache) {
});

