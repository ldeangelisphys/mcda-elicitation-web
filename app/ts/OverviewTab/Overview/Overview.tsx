import {Grid} from '@material-ui/core';
import {EffectsTableContextProviderComponent} from 'app/ts/EffectsTable/EffectsTableContext';
import {SettingsContext} from 'app/ts/Settings/SettingsContext';
import {WorkspaceContext} from 'app/ts/Workspace/WorkspaceContext';
import React, {useContext} from 'react';
import DownloadWorkspace from './DownloadWorkspace/DownloadWorkspace';
import OverviewAlternatives from './OverviewAlternatives/OverviewAlternatives';
import OverviewCriteria from './OverviewCriteria/OverviewCriteria';
import TherapeuticContext from './TherapeuticContext/TherapeuticContext';

export default function Overview() {
  const {
    settings: {displayMode}
  } = useContext(SettingsContext);
  const {
    workspace: {
      properties: {title}
    }
  } = useContext(WorkspaceContext);

  document.title = `${title}'s overview`;

  return (
    <Grid container spacing={2}>
      <DownloadWorkspace />
      <TherapeuticContext />
      <OverviewAlternatives />
      <EffectsTableContextProviderComponent displayMode={displayMode}>
        <OverviewCriteria />
      </EffectsTableContextProviderComponent>
    </Grid>
  );
}
