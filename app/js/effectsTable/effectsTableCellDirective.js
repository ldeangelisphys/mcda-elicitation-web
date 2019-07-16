'use strict';
define(['lodash'], function(_) {

  var dependencies = ['significantDigits'];

  var EffectsTableScalesCellDirective = function(significantDigits) {
    return {
      restrict: 'E',
      scope: {
        'effectsTableInfo': '=',
        'workspaceSettings': '=',
        'scales': '=',
        'theoreticalScale': '=',
        'alternativeId': '='
      },
      templateUrl: './effectsTableCellDirective.html',
      link: function(scope) {
        init();

        scope.$watch('workspaceSettings', init, true);

        function init() {
          scope.uncertainty = hasUncertainty(scope.effectsTableInfo);
          scope.effectsDisplay = scope.workspaceSettings.effectsDisplay;
          scope.isAbsolute = scope.effectsTableInfo.isAbsolute;
          scope.effectValue = '';
          if (scope.effectsTableInfo.studyDataLabelsAndUncertainty) {
            var labelsAndUncertainty = scope.effectsTableInfo.studyDataLabelsAndUncertainty[scope.alternativeId];
            scope.effectLabel = labelsAndUncertainty.effectLabel;
            scope.distributionLabel = labelsAndUncertainty.distributionLabel;
            scope.effectValue = labelsAndUncertainty.effectValue;
            if (scope.effectValue !== '') {
              if (_.isEqual(scope.theoreticalScale, [0, 100])) {
                scope.effectValue *= 100;
              }
              scope.effectValue = significantDigits(scope.effectValue);
            }
          }
        }

        function hasUncertainty(info) {
          return info.hasUncertainty || info.studyDataLabelsAndUncertainty[scope.alternativeId].hasUncertainty;
        }
      }

    };
  };
  return dependencies.concat(EffectsTableScalesCellDirective);
});
