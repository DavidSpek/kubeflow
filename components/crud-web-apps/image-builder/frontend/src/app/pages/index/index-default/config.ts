import {
  PropertyValue,
  StatusValue,
  ActionListValue,
  ActionIconValue,
  ActionButtonValue,
  TRUNCATE_TEXT_SIZE,
  MenuValue,
  DialogConfig,
} from 'kubeflow';

// --- Configs for the Confirm Dialogs ---
export function getDeleteDialogConfig(name: string): DialogConfig {
  return {
    title: `Are you sure you want to delete this Builder job? ${name}`,
    message:
      'Warning: Your data might be lost if the builder is not' +
      ' backed by persistent storage',
    accept: 'DELETE',
    confirmColor: 'warn',
    cancel: 'CANCEL',
    error: '',
    applying: 'DELETING',
    width: '600px',
  };
}

// --- Config for the Resource Table ---
export const defaultConfig = {
  title: 'Image Building Jobs',
  newButtonText: 'BUILD NEW IMAGE',
  columns: [
    {
      matHeaderCellDef: 'Status',
      matColumnDef: 'status',
      value: new StatusValue(),
    },
    {
      matHeaderCellDef: 'Name',
      matColumnDef: 'name',
      value: new PropertyValue({
        field: 'name',
        truncate: TRUNCATE_TEXT_SIZE.SMALL,
        tooltipField: 'name',
      }),
    },
    {
      matHeaderCellDef: 'Age',
      matColumnDef: 'age',
      value: new PropertyValue({ field: 'age' }),
    },
    {
      matHeaderCellDef: 'Image',
      matColumnDef: 'image',
      value: new PropertyValue({
        field: 'base_image',
        tooltipField: 'image',
        truncate: TRUNCATE_TEXT_SIZE.MEDIUM,
      }),
    },

    {
      matHeaderCellDef: '',
      matColumnDef: 'actions',
      value: new ActionListValue([
        new ActionIconValue({
          name: 'delete',
          tooltip: 'Delete this Image Build Job',
          color: '',
          field: 'deleteAction',
          iconReady: 'material:delete',
        }),
      ]),
    },
  ],
};
