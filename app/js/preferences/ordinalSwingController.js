'use strict';
define(['lodash', '../controllers/wizard'], function(_, Wizard) {
  var dependencies = [
    '$scope', '$state', '$stateParams', '$injector',
    'PartialValueFunctionService',
    'PageTitleService',
    'OrderingService',
    'currentScenario',
    'taskDefinition'
  ];
  var OrdinalSwingController = function($scope, $state, $stateParams, $injector,
    PartialValueFunctionService,
    PageTitleService,
    OrderingService,
    currentScenario,
    taskDefinition
  ) {
    //functions 
    $scope.save = save;
    $scope.canSave = canSave;
    $scope.cancel = cancel;

    //init
    $scope.problem = $scope.aggregateState.problem;
    $scope.pvf = PartialValueFunctionService;
    $scope.$on('elicit.settingsChanged', function() {
      $scope.problem = $scope.aggregateState.problem;
      resetWizard();
    });

    PageTitleService.setPageTitle('OrdinalSwingController', 'Ranking');
    resetWizard();

    function resetWizard() {
      OrderingService.getOrderedCriteriaAndAlternatives($scope.aggregateState.problem, $stateParams).then(function(orderings) {
        $scope.criteria = _.map(orderings.criteria, function(criterion) {
          criterion.best = PartialValueFunctionService.best(criterion.dataSources[0]);
          criterion.worst = PartialValueFunctionService.worst(criterion.dataSources[0]);
          setUnitOfMeasurement(criterion);
          return criterion;
        });
        $injector.invoke(Wizard, {}, {
          $scope: $scope,
          handler: {
            validChoice: validChoice,
            fields: ['choice', 'reference', 'choices', 'type', 'standardized', 'previousChoice'],
            nextState: nextState,
            initialize: initialize,
            standardize: standardize
          }
        });
      });
    }

    function setUnitOfMeasurement(criterion) {
      if (_.isEqual(criterion.dataSources[0].scale, [0, 1])) {
        criterion.unitOfMeasurement = '';
      } else if (_.isEqual(criterion.dataSources[0].scale, [0, 100])) {
        criterion.unitOfMeasurement = '%';
      }
    }

    function save(state) {
      var nextState = standardize(state);
      currentScenario.state = _.extend({}, currentScenario.state,
        {
          prefs: nextState.prefs
        });
      currentScenario.$save($stateParams, function(scenario) {
        $scope.$emit('elicit.resultsAccessible', scenario);
        $state.go('preferences');
      });
    }

    function canSave(state) {
      return state && _.size(state.choices) === 2;
    }

    function cancel() {
      $state.go('preferences');
    }

    function title(step, total) {
      var base = 'Ranking';
      return base + ' (' + step + '/' + total + ')';
    }

    function initialize() {
      var state = taskDefinition.clean($scope.aggregateState);
      var fields = {
        title: title(1, _.size($scope.criteria) - 1),
        type: 'elicit',
        prefs: {
          ordinal: []
        },
        reference: _.cloneDeep($scope.criteria),
        choices: _.cloneDeep($scope.criteria)
      };
      return _.extend(state, fields);
    }

    function validChoice(state) {
      return state && _.includes(_.map($scope.criteria, 'id'), state.choice);
    }

    function nextState(state) {
      if (!validChoice(state)) {
        return null;
      }
      var choiceCriterion = _.find($scope.criteria, function(criterion) { return criterion.id === state.choice; });
      choiceCriterion.alreadyChosen = true;

      var nextState = _.cloneDeep(state);
      nextState.choice = undefined;
      nextState.choices = _.reject(nextState.choices, function(criterion) { return criterion.id === state.choice; });
      nextState.prefs.ordinal.push(state.choice);
      nextState.title = title(nextState.prefs.ordinal.length + 1, $scope.criteria.length - 1);

      return nextState;
    }

    function standardize(state) {
      var standardizedState = _.cloneDeep(state);
      var prefs = standardizedState.prefs;
      var order = prefs.ordinal;

      function ordinal(a, b) {
        return {
          type: 'ordinal',
          criteria: [a, b]
        };
      }

      if (order.length === $scope.criteria.length - 2) {
        order.push(state.choice);
      }
      var result = [];
      for (var i = 0; i < order.length - 1; i++) {
        result.push(ordinal(order[i], order[i + 1]));
      }
      if (order.length > 0) {
        var remaining = _.difference(_.map($scope.criteria, 'id'), order).sort();
        result = result.concat(_.map(remaining, function(criterion) {
          return ordinal(_.last(order), criterion);
        }));
      }
      standardizedState.prefs = result;
      return standardizedState;
    }
  };
  return dependencies.concat(OrdinalSwingController);
});
