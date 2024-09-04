// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdEventsBasedObject extends gdAbstractEventsBasedEntity {
  constructor(): void;
  setDescription(description: string): gdEventsBasedObject;
  getDescription(): string;
  setName(name: string): gdEventsBasedObject;
  getName(): string;
  setFullName(fullName: string): gdEventsBasedObject;
  getFullName(): string;
  setDefaultName(defaultName: string): gdEventsBasedObject;
  getDefaultName(): string;
  markAsRenderedIn3D(isRenderedIn3D: boolean): gdEventsBasedObject;
  isRenderedIn3D(): boolean;
  markAsAnimatable(isAnimatable: boolean): gdEventsBasedObject;
  isAnimatable(): boolean;
  markAsTextContainer(isTextContainer: boolean): gdEventsBasedObject;
  isTextContainer(): boolean;
  markAsInnerAreaExpandingWithParent(value: boolean): gdEventsBasedObject;
  isInnerAreaFollowingParentSize(): boolean;
  getInitialInstances(): gdInitialInstancesContainer;
  getLayers(): gdLayersContainer;
  getObjects(): gdObjectsContainer;
  getAreaMinX(): number;
  getAreaMinY(): number;
  getAreaMinZ(): number;
  getAreaMaxX(): number;
  getAreaMaxY(): number;
  getAreaMaxZ(): number;
  setAreaMinX(value: number): void;
  setAreaMinY(value: number): void;
  setAreaMinZ(value: number): void;
  setAreaMaxX(value: number): void;
  setAreaMaxY(value: number): void;
  setAreaMaxZ(value: number): void;
  static getPropertyActionName(propertyName: string): string;
  static getPropertyConditionName(propertyName: string): string;
  static getPropertyExpressionName(propertyName: string): string;
  static getPropertyToggleActionName(propertyName: string): string;
  delete(): void;
  ptr: number;
};