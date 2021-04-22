import {DeterministicResultsContext} from 'app/ts/DeterministicTab/DeterministicResultsContext/DeterministicResultsContext';
import {getSensitivityLineChartSettings} from 'app/ts/DeterministicTab/DeterministicResultsUtil';
import {LegendContext} from 'app/ts/Legend/LegendContext';
import {SettingsContext} from 'app/ts/Settings/SettingsContext';
import {CurrentSubproblemContext} from 'app/ts/Workspace/SubproblemsContext/CurrentSubproblemContext/CurrentSubproblemContext';
import {ChartConfiguration, generate} from 'c3';
import React, {useContext, useEffect} from 'react';

export default function MeasurementSensitivityPlot(): JSX.Element {
  const {filteredAlternatives} = useContext(CurrentSubproblemContext);
  const {legendByAlternativeId} = useContext(LegendContext);
  const {
    measurementSensitivityCriterion,
    measurementsSensitivityResults
  } = useContext(DeterministicResultsContext);
  const {getUsePercentage} = useContext(SettingsContext);
  const width = '400px';
  const height = '400px';

  useEffect(() => {
    const usePercentage = getUsePercentage(measurementSensitivityCriterion);
    const settings: ChartConfiguration = getSensitivityLineChartSettings(
      measurementsSensitivityResults,
      filteredAlternatives,
      legendByAlternativeId,
      measurementSensitivityCriterion.title,
      true,
      '#measurements-sensitivity-plot',
      usePercentage
    );
    generate(settings);
  }, [
    filteredAlternatives,
    getUsePercentage,
    legendByAlternativeId,
    measurementSensitivityCriterion,
    measurementsSensitivityResults
  ]);

  return (
    <div
      style={{width: width, height: height}}
      id="measurements-sensitivity-plot"
    />
  );
}
