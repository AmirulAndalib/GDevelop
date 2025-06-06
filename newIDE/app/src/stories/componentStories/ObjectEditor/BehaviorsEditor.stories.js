// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import BehaviorsEditor from '../../../BehaviorsEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/BehaviorsEditor',
  component: BehaviorsEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithBehaviors}
      resourceManagementProps={fakeResourceManagementProps}
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onExtensionInstalled={action('extension installed')}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const WithoutAnyBehaviors = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithoutBehaviors}
      resourceManagementProps={fakeResourceManagementProps}
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onExtensionInstalled={action('extension installed')}
      isListLocked={false}
    />
  </SerializedObjectDisplay>
);

export const Locked = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithBehaviors}
      resourceManagementProps={fakeResourceManagementProps}
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onExtensionInstalled={action('extension installed')}
      isListLocked={true}
    />
  </SerializedObjectDisplay>
);

export const LockedWithoutAnyBehaviors = () => (
  <SerializedObjectDisplay object={testProject.spriteObjectWithoutBehaviors}>
    <BehaviorsEditor
      project={testProject.project}
      eventsFunctionsExtension={null}
      object={testProject.spriteObjectWithoutBehaviors}
      resourceManagementProps={fakeResourceManagementProps}
      onUpdateBehaviorsSharedData={() => {}}
      openBehaviorEvents={() => action('Open behavior events')}
      onBehaviorsUpdated={() => {}}
      onExtensionInstalled={action('extension installed')}
      isListLocked={true}
    />
  </SerializedObjectDisplay>
);
