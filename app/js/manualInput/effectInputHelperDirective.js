'use strict';
define(['lodash'], function (_) {
  var ESC = 27;
  var ENTER = 13;

  var dependencies = ['ManualInputService', '$timeout'];

  var EffectInputHelperDirective = function (ManualInputService, $timeout) {
    return {
      restrict: 'E',
      scope: {
        'criterion': '=',
        'alternative': '=',
        'inputData': '=',
        'changeCallback': '='
      },
      templateUrl: 'js/manualInput/effectInputHelperDirective.html',
      link: function (scope) {
        // functions
        scope.keyCheck = keyCheck;
        scope.updateUpperBound = updateUpperBound;
        scope.inputChanged = inputChanged;

        //init
        var isEscPressed = false;

        initInputParameters();
        scope.inputData.label = ManualInputService.inputToString(scope.inputCell);

        scope.$on('open.af.dropdownToggle', function () {
          isEscPressed = false;
        });

        scope.$on('close.af.dropdownToggle', function () {
          if (!isEscPressed) {
            saveState();
          }
        });

        function updateUpperBound() {
          var id = scope.inputCell.inputParameters.id;
          if (scope.inputCell.isNormal && id === 'continuousMeanConfidenceInterval') {
            scope.inputCell.thirdParameter = 2 * scope.inputCell.firstParameter - scope.inputCell.secondParameter;
          }
        }

        function saveState() {
          $timeout(function () {
            scope.inputData = scope.inputCell;
            scope.inputData.isInvalid = ManualInputService.getInputError(scope.inputCell);
            scope.inputData.label = ManualInputService.inputToString(scope.inputCell);
            $timeout(function () {
              scope.changeCallback();
            });
          });
        }

        function initInputParameters() {
          if (doInputParametersNeedUpdating(scope.criterion, scope.inputData)) {
            scope.inputCell = _.pick(scope.criterion, ['inputType', 'inputMethod', 'dataType', 'parameterOfInterest']);
          } else {
            scope.inputCell = _.cloneDeep(scope.inputData);
          }
          scope.inputParameterOptions = ManualInputService.getOptions(scope.inputCell);
          if (!scope.inputCell.inputParameters) {
            scope.inputCell.inputParameters = _.values(scope.inputParameterOptions)[0];
            if (scope.inputCell.parameterOfInterest === 'cumulativeProbability') {
              scope.inputCell.scale = 'percentage';
            }
          } else {
            scope.inputCell.inputParameters = scope.inputParameterOptions[scope.inputCell.inputParameters.id];
          }
        }

        function inputChanged() {
          scope.error = ManualInputService.getInputError(scope.inputCell);
          updateUpperBound();
        }

        function keyCheck(event) {
          if (event.keyCode === ESC) {
            isEscPressed = true;
            scope.$broadcast('doClose.af.dropdownToggle');
          } else if (event.keyCode === ENTER) {
            scope.$broadcast('doClose.af.dropdownToggle');
          }
        }

        function doInputParametersNeedUpdating(criterion, cell) {
          if (!cell.inputParameters) {
            return true;
          }
          var inputType = criterion.inputType;
          var inputMethod = criterion.inputMethod;
          var dataType = criterion.dataType;
          return inputType !== cell.inputType ||
            (inputType === 'distribution' && inputMethod !== cell.inputMethod) ||
            (inputType === 'distribution' && inputMethod === 'assistedDistribution' && dataType !== cell.dataType) ||
            (inputType === 'effect' && dataType !== cell.dataType) ||
            (inputType === 'effect' && dataType === 'continuous' && criterion.parameterOfInterest !== cell.parameterOfInterest);
        }
      }
    };
  };
  return dependencies.concat(EffectInputHelperDirective);
});