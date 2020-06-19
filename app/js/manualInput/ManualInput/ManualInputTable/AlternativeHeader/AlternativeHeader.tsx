import {IconButton, TableCell, Tooltip, Button} from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
import React, {useContext} from 'react';
import IAlternative from '../../../../interface/IAlternative';
import {ManualInputContext} from '../../../ManualInputContext';
import InlineEditor from '../InlineEditor/InlineEditor';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowLeft from '@material-ui/icons/ArrowLeft';

export default function AlternativeHeader({
  alternative,
  nextAlternative,
  previousAlternative
}: {
  alternative: IAlternative;
  nextAlternative: IAlternative;
  previousAlternative: IAlternative;
}) {
  const {deleteAlternative, setAlternative, swapAlternatives} = useContext(
    ManualInputContext
  );

  function handleDelete() {
    deleteAlternative(alternative.id);
  }

  function handleChange(newTitle: string) {
    setAlternative({...alternative, title: newTitle});
  }

  function moveLeft() {
    swapAlternatives(alternative.id, previousAlternative.id);
  }

  function moveRight() {
    swapAlternatives(alternative.id, nextAlternative.id);
  }

  return (
    <TableCell align="center">
      <Button disabled={!previousAlternative} onClick={moveLeft}>
        <ArrowLeft />
      </Button>
      <InlineEditor
        value={alternative.title}
        callback={handleChange}
        tooltipText={'Edit alternative title'}
        errorOnEmpty={true}
      />
      <Tooltip title="Delete alternative">
        <IconButton size="small" color="secondary" onClick={handleDelete}>
          <Delete fontSize={'small'} />
        </IconButton>
      </Tooltip>
      <Button disabled={!nextAlternative} onClick={moveRight}>
        <ArrowRight />
      </Button>
    </TableCell>
  );
}
