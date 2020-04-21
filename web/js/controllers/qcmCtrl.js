angular.module('qcmffvlQCMCtrl', []).controller('QCMCtrl', function($scope, $filter, $location, $timeout, dialogs, API, filterFilter) {
    $scope.questions = [];
    $scope.$parent.hideNavbarButtons = false;

    if (!$scope.$parent.qcm) {
        $scope.$parent.loadJSON();
    }

    $scope.categorySelected = function () {
        return ($scope.$storage.conf.category.indexOf("Toutes") == -1);
    }

    $scope.toggleCheck = function(q, answer) {
        if ($scope.navCollapsed && !$scope.main.checkAnswers && !$scope.main.exam.papier && !$scope.isHelpQuestion(q)) {
            answer.checked = !answer.checked;

            var index = null;
            for (var i=0; i<q.ans.length && !index; i++) {
                if (answer.text === q.ans[i].text) {
                    index = i;
                }
            }
            // code to store answers in local storage
            // if there are no more answers checked, then delete stored QCMID
            if (answer.checked) {
                if (!$scope.$storage.answers[q.code])
                    $scope.$storage.answers[q.code] = [];
                $scope.$storage.answers[q.code].push(index);
                $scope.$storage.QCMID = $scope.main.QCMID;
            } else {
                var i = $scope.$storage.answers[q.code].indexOf(index); 
                if (i != -1) 
                    $scope.$storage.answers[q.code].splice(i,1);
                if ($scope.$storage.answers[q.code].length == 0)
                    delete $scope.$storage.answers[q.code];
                delete $scope.$storage.QCMID;
            }
        }
    }

    $scope.getPoints = function(question) {
        var total = 0;
        for (var i = 0; i < question.ans.length; i++) {
            if (question.ans[i].checked) {
                total += parseInt(question.ans[i].pts);
            }
        }
        if (total < 0) {
            total = 0;
        }
        return total;
    }

    $scope.getScore = function() {
        var arr = filterFilter($scope.qcm, $scope.main.search);
        arr = $filter('categoryFilter')(arr, $scope.$storage.conf.category);
        arr = $filter('limitTo')(arr, $scope.main.limit);
        var score = { user: 0, nb: 0, percentage: 0 };
        for(var i = 0; i < arr.length; i++){
            var question = arr[i];
            score.user += $scope.getPoints(question);
        }
        score.nb = i;
        score.total = i*6;
        if (score.total > 0) {
            score.percentage = Math.round(score.user / score.total * 100);
        }
        return score;
    }


    $scope.successQuestion = function(question) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers || $scope.isHelpQuestion(question))
            return false;
        return ($scope.getPoints(question) === 6);
    }

    $scope.failedQuestion = function(question) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers || $scope.isHelpQuestion(question))
            return false;
        return ($scope.getPoints(question) === 0);
    }

    $scope.warningQuestion = function(question) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers || $scope.isHelpQuestion(question))
            return false;
        var points = $scope.getPoints(question);
        return (points >= 1 && points <=5);
    }

    $scope.goodAnswer = function(answer) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers)
            return false;
        return (answer.pts >= 0 && answer.checked);
    }

    $scope.badAnswer = function(answer) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers)
            return false;
        return (answer.pts < 0 && answer.checked);
    }

    $scope.goodAnswerNotChecked = function(answer) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers)
            return false;
        return (answer.pts > 0 && !answer.checked);
    }

    $scope.badAnswerNotChecked = function(answer) {
        if ($scope.main.exam.papier || !$scope.main.checkAnswers)
            return false;
        return (answer.pts < 0 && !answer.checked);
    }

    $scope.updateScore = function() {
        if ($scope.main.checkAnswers) {
            $scope.main.score = $scope.getScore();
        }
    }


    $scope.isHelpQuestion = function(q) {
        if (q && !$scope.main.exam.papier) {
            return (q.code == $scope.main.helpQuestion);
        } else {
            return false;
        }
    }
    $scope.resetHelpQuestion = function() {
            $scope.main.helpQuestion = "";
    }

    $scope.mailtoclick = function(q, index) {
        var text = "Merci d'utiliser cette fonctionnalité uniquement pour remonter un problème avec la question ou ses réponses (incohérence, mauvaise formulation, fautes de français...).<br/>"
                    + "Si vous souhaitez des explications, merci de vous tourner vers une école de vol libre.<br/><br/>"
                    + "Continuer ? (répondre \"oui\" va ouvrir une fenêtre de votre client mail)"
        var dlg = dialogs.confirm('Confirmation', text);
        dlg.result.then(function(btn){
            // wait for modal to close to avoid weird effects
            $timeout(function() {
                // ugly (but effective !) way of re-setting q.help, since it is toggled when clicking on the envelope (because it sits in the panel)
                $scope.resetHelpQuestion(q);
                var separator = "---------------------------------" + "\n"
                var subject = "Question " + q.code + "   " + "[QCM " + $scope.qcmVersion + " / WebApp " + $scope.version + " / QCMID " + $scope.main.QCMID + "]";
                var body = "\n\n\n" + separator +
                            "Question " + q.code + "\n" +
                            "#" + index + " du questionnaire : " + $scope.main.QCMIDURL + "\n" +
                            separator +
                            index + ". " + q.question + "\n\n";
                for (var i=0; i<q.ans.length; i++) {
                    body += "- " + q.ans[i].text + " (" + q.ans[i].pts + ")\n";
                }

                var uri = "mailto:request-qcm@ffvl.fr?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
                window.location.href = uri;
            }, 300);
        },function(btn){
            //cancel
        });

    }

    $scope.$watch('main.checkAnswers', function(newval, oldval) {
        if (oldval != newval)
            $scope.updateScore();
        if (newval == true)
            $scope.$parent.deleteStoredAnswers();
    });

});