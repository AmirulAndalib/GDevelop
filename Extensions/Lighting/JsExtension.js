//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'Lighting',
        _('Lights'),

        'This provides a light object, and a behavior to mark other objects as being obstacles for the lights. This is a great way to create a special atmosphere to your game, along with effects, make it more realistic or to create gameplays based on lights.',
        'Harsimran Virk',
        'MIT'
      )
      .setCategory('Visual effect')
      .setTags('light');

    const lightObstacleBehavior = new gd.BehaviorJsImplementation();
    lightObstacleBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };

    lightObstacleBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      return behaviorProperties;
    };

    lightObstacleBehavior.initializeContent = function (behaviorContent) {};
    extension
      .addBehavior(
        'LightObstacleBehavior',
        _('Light Obstacle Behavior'),
        'LightObstacleBehavior',
        _(
          'Flag objects as being obstacles to light. The light emitted by light objects will be stopped by the object.'
        ),
        '',
        'CppPlatform/Extensions/lightObstacleIcon32.png',
        'LightObstacleBehavior',
        //@ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
        lightObstacleBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/Lighting/lightobstacleruntimebehavior.js')
      .addIncludeFile('Extensions/Lighting/lightruntimeobject.js')
      .addIncludeFile(
        'Extensions/Lighting/lightruntimeobject-pixi-renderer.js'
      );

    const lightObject = new gd.ObjectJsImplementation();

    lightObject.updateProperty = function (propertyName, newValue) {
      const objectContent = this.content;
      if (propertyName === 'radius') {
        objectContent.radius = parseFloat(newValue);
        return true;
      }

      if (propertyName === 'color') {
        objectContent.color = newValue;
        return true;
      }

      if (propertyName === 'debugMode') {
        objectContent.debugMode = newValue === '1';
        return true;
      }

      if (propertyName === 'texture') {
        objectContent.texture = newValue;
        return true;
      }

      return false;
    };

    lightObject.getProperties = function () {
      const objectProperties = new gd.MapStringPropertyDescriptor();
      const objectContent = this.content;

      objectProperties.set(
        'radius',
        new gd.PropertyDescriptor(objectContent.radius.toString())
          .setType('number')
          .setLabel(_('Radius'))
      );

      objectProperties.set(
        'color',
        new gd.PropertyDescriptor(objectContent.color)
          .setType('color')
          .setLabel(_('Color'))
      );

      objectProperties.set(
        'debugMode',
        new gd.PropertyDescriptor(objectContent.debugMode ? 'true' : 'false')
          .setType('boolean')
          .setLabel(_('Debug mode'))
          .setDescription(
            _(
              'When activated, display the lines used to render the light - useful to understand how the light is rendered on screen.'
            )
          )
          .setGroup(_('Advanced'))
      );

      objectProperties
        .getOrCreate('texture')
        .setValue(objectContent.texture)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Light texture (optional)'))
        .setDescription(
          _(
            "A texture to be used to display the light. If you don't specify a texture, the light is rendered as fading from bright, in its center, to dark."
          )
        );

      return objectProperties;
    };
    lightObject.content = {
      radius: 50,
      color: '255;255;255',
      debugMode: false,
      texture: '',
    };

    lightObject.updateInitialInstanceProperty = function (
      instance,
      propertyName,
      newValue
    ) {
      return false;
    };

    lightObject.getInitialInstanceProperties = function (instance) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'LightObject',
        _('Light'),
        _(
          'Displays a light on the scene, with a customizable radius and color. Add then the Light Obstacle behavior to the objects that must act as obstacle to the lights.'
        ),
        'CppPlatform/Extensions/lightIcon32.png',
        lightObject
      )
      .setIncludeFile('Extensions/Lighting/lightruntimeobject.js')
      .addIncludeFile('Extensions/Lighting/lightruntimeobject-pixi-renderer.js')
      .addIncludeFile('Extensions/Lighting/lightobstacleruntimebehavior.js')
      .setCategoryFullName(_('Visual effect'))
      .addDefaultBehavior('EffectCapability::EffectBehavior');

    object
      .addAction(
        'SetRadius',
        _('Light radius'),
        _('Set the radius of light object'),
        _('Set the radius of _PARAM0_ to: _PARAM1_'),
        '',
        'CppPlatform/Extensions/lightIcon24.png',
        'CppPlatform/Extensions/lightIcon16.png'
      )
      .addParameter('object', _('Object'), 'LightObject', false)
      .addParameter('expression', _('Radius'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setRadius');

    object
      .addAction(
        'SetColor',
        _('Light color'),
        _('Set the color of light object in format "R;G;B" string.'),
        _('Set the color of _PARAM0_ to: _PARAM1_'),
        '',
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Object'), 'LightObject', false)
      .addParameter('color', _('Color'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setColor');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },

  registerEditorConfigurations: function (objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      'Lighting::LightObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/all-features/lighting/reference',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /**
     * Renderer for instances of LightObject inside the IDE.
     */
    class RenderedLightObjectInstance extends RenderedInstance {
      _radius = 0;
      _color = 0;
      /** @type {PIXI.Graphics} The circle to show the radius of the light */
      _radiusGraphics;

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        // The icon in the middle.
        const lightIconSprite = new PIXI.Sprite(
          PIXI.Texture.from('CppPlatform/Extensions/lightIcon32.png')
        );
        lightIconSprite.anchor.x = 0.5;
        lightIconSprite.anchor.y = 0.5;

        this._radiusGraphics = new PIXI.Graphics();

        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(lightIconSprite);
        this._pixiObject.addChild(this._radiusGraphics);
        this._pixiContainer.addChild(this._pixiObject);
        this.update();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        // Keep textures because they are shared by all sprites.
        this._pixiObject.destroy({ children: true });
      }

      /**
       * Return the path to the thumbnail of the specified object.
       */
      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'CppPlatform/Extensions/lightIcon32.png';
      }

      /**
       * This is called to update the PIXI object on the scene editor
       */
      update() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );

        this._pixiObject.position.x = this._instance.getX();
        this._pixiObject.position.y = this._instance.getY();

        let radiusGraphicsDirty = false;

        let radius = object.content.radius;
        if (radius <= 0) radius = 1;
        if (radius !== this._radius) {
          this._radius = radius;
          radiusGraphicsDirty = true;
        }

        const color = objectsRenderingService.rgbOrHexToHexNumber(
          object.content.color
        );
        if (color !== this._color) {
          this._color = color;
          radiusGraphicsDirty = true;
        }

        if (radiusGraphicsDirty) {
          const radiusBorderWidth = 2;
          this._radiusGraphics.clear();
          this._radiusGraphics.lineStyle(radiusBorderWidth, color, 0.8);
          this._radiusGraphics.drawCircle(
            0,
            0,
            Math.max(1, this._radius - radiusBorderWidth)
          );
        }
      }

      /**
       * Return the width of the instance, when it's not resized.
       */
      getDefaultWidth() {
        return this._radius * 2;
      }

      /**
       * Return the height of the instance, when it's not resized.
       */
      getDefaultHeight() {
        return this._radius * 2;
      }

      getOriginX() {
        return this._radius;
      }

      getOriginY() {
        return this._radius;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'Lighting::LightObject',
      RenderedLightObjectInstance
    );
  },
};
