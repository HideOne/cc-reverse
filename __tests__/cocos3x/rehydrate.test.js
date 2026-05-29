const { rehydrateIFileData, DataTypeID, VALUE_TYPE_CONSTRUCTORS } = require('../../src/core/cocos3x/rehydrate');

// Helper: build an IFileData tuple. Mirrors the runtime layout so tests read
// close to the real input.
function build({
  version = 1,
  sharedUuids = [],
  sharedStrings = [],
  sharedClasses = [],
  sharedMasks = [],
  instances = [],
  instanceTypes = 0,
  refs = null,
  dependObjs = [],
  dependKeys = [],
  dependUuidIndices = [],
} = {}) {
  return [
    version,
    sharedUuids,
    sharedStrings,
    sharedClasses,
    sharedMasks,
    instances,
    instanceTypes,
    refs,
    dependObjs,
    dependKeys,
    dependUuidIndices,
  ];
}

describe('rehydrateIFileData', () => {
  it('returns null for non-IFileData inputs', () => {
    expect(rehydrateIFileData(null)).toBeNull();
    expect(rehydrateIFileData({ __type__: 'cc.Node' })).toBeNull();
    expect(rehydrateIFileData([1, 2, 3])).toBeNull();
  });

  it('rehydrates a minimal class instance with simple-typed props', () => {
    // One cc.Node instance with _name and _active.
    const doc = build({
      sharedClasses: [
        ['cc.Node', ['_name', '_active'], 0],  // no advanced props
      ],
      sharedMasks: [
        [0, 0, 1, 3],  // class 0, prop indices [0, 1], offset=3 (everything simple)
      ],
      instances: [
        [0, 'Root', true],
      ],
    });

    const out = rehydrateIFileData(doc);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({
      __type__: 'cc.Node',
      _name: 'Root',
      _active: true,
    });
  });

  it('emits {__id__} for InstanceRef properties', () => {
    const doc = build({
      sharedClasses: [
        // classTypeOffset = 3 - numSimple(1) = 2 → keys[1] type = class[1+2] = class[3] = InstanceRef
        ['cc.SceneAsset', ['_name', 'scene'], 2, DataTypeID.InstanceRef],
        ['cc.Scene', ['_name'], 3],  // no advanced, offset irrelevant
      ],
      sharedMasks: [
        [0, 0, 1, 2],  // SceneAsset: _name simple, scene advanced; offset=2 (index in objectData where advanced starts)
        [1, 0, 2],     // Scene: _name only, objectData offset=2 (all simple)
      ],
      instances: [
        [0, 'Main', 1],   // SceneAsset: _name='Main', scene=ref to instance 1
        [1, 'Main'],      // Scene: _name='Main'
      ],
    });

    const out = rehydrateIFileData(doc);
    expect(out[0]).toEqual({
      __type__: 'cc.SceneAsset',
      _name: 'Main',
      scene: { __id__: 1 },
    });
    expect(out[1]).toEqual({ __type__: 'cc.Scene', _name: 'Main' });
  });

  it('resolves {__uuid__} via dependObjs/Keys/UuidIndices', () => {
    // A cc.SpriteFrame with a texture asset ref on property _texture.
    const doc = build({
      sharedUuids: ['TEX-UUID-1'],
      sharedStrings: ['_texture'],
      sharedClasses: [
        ['cc.SpriteFrame', ['_name', '_texture'], 2, DataTypeID.AssetRefByInnerObj],
      ],
      sharedMasks: [
        [0, 0, 1, 2],
      ],
      instances: [
        [0, 'Frame1', 0],  // _texture advanced = depend-obj index 0
      ],
      dependObjs: [0],         // runtime-style: owning instance index (we ignore, use our direct track)
      dependKeys: [0],         // sharedStrings[0] = '_texture'
      dependUuidIndices: [0],  // sharedUuids[0] = 'TEX-UUID-1'
    });

    const out = rehydrateIFileData(doc);
    expect(out[0]).toEqual({
      __type__: 'cc.SpriteFrame',
      _name: 'Frame1',
      _texture: { __uuid__: 'TEX-UUID-1' },
    });
  });

  it('decodes ValueType (Vec3) into plain object', () => {
    const doc = build({
      sharedClasses: [
        ['cc.Node', ['_name', '_lpos'], 2, DataTypeID.ValueType],
      ],
      sharedMasks: [
        [0, 0, 1, 2],
      ],
      instances: [
        [0, 'n', [1, 10, 20, 30]],  // Vec3 { x:10, y:20, z:30 }
      ],
    });
    const out = rehydrateIFileData(doc);
    expect(out[0]).toEqual({
      __type__: 'cc.Node',
      _name: 'n',
      _lpos: { __type__: 'cc.Vec3', x: 10, y: 20, z: 30 },
    });
  });

  it('decodes Color ValueType (uint32 ABGR → rgba)', () => {
    const doc = build({
      sharedClasses: [
        ['cc.Sprite', ['color'], 3, DataTypeID.ValueType],
      ],
      sharedMasks: [
        [0, 0, 1],
      ],
      instances: [
        // ABGR: a=255, b=46, g=38, r=27 → 0xFF2E261B
        [0, [4, 0xFF2E261B]],
      ],
    });
    const out = rehydrateIFileData(doc);
    expect(out[0].color).toEqual({
      __type__: 'cc.Color',
      r: 27,
      g: 38,
      b: 46,
      a: 255,
    });
  });

  it('handles back-references via the refs table', () => {
    // Instance 0 (cc.Node) has _parent pointing back to instance 1 via refs.
    // InstanceRef encoded as -1 → ~value=0 → refs slot 0 = owner
    const doc = build({
      sharedStrings: ['_parent'],
      sharedClasses: [
        ['cc.Node', ['_name', '_parent'], 2, DataTypeID.InstanceRef],
      ],
      sharedMasks: [
        [0, 0, 1, 2],
      ],
      instances: [
        [0, 'child', -1],   // placeholder back-ref; ~(-1) = 0 → refs slot 0
        [0, 'parent', null],
      ],
      refs: [
        // slot 0: [owner, key=<stringIdx 0>, target=1]
        0,        // owner placeholder — resolved via pendingOwners from assignInstanceRef
        0,        // key = sharedStrings[0] = '_parent'
        1,        // target instance index
        1,        // boundary offset: 1 record in the first region
      ],
    });
    const out = rehydrateIFileData(doc);
    expect(out[0]._parent).toEqual({ __id__: 1 });
    expect(out[1]._name).toBe('parent');
  });

  it('unwraps Array_InstanceRef into array of {__id__}', () => {
    const doc = build({
      sharedClasses: [
        ['cc.Node', ['_name', '_children'], 2, DataTypeID.Array_InstanceRef],
      ],
      sharedMasks: [[0, 0, 1, 2]],
      instances: [
        [0, 'root', [1, 2, 3]],
        [0, 'a', null],
        [0, 'b', null],
        [0, 'c', null],
      ],
    });
    const out = rehydrateIFileData(doc);
    expect(out[0]._children).toEqual([
      { __id__: 1 },
      { __id__: 2 },
      { __id__: 3 },
    ]);
  });

  it('unwraps a Dict value', () => {
    const doc = build({
      sharedClasses: [
        // 0 simple, 1 advanced: offset = 3 - 0 = 3 → keys[0] type = class[0+3] = class[3]
        ['cc.TestDict', ['data'], 3, DataTypeID.Dict],
      ],
      sharedMasks: [[0, 0, 1]],
      instances: [
        // Dict: [plainJson, key, type, value]
        [0, [{ a: 1, b: 2 }, 'nested', DataTypeID.InstanceRef, 1]],
        [0, 'target', null],
      ],
    });
    const out = rehydrateIFileData(doc);
    expect(out[0].data).toEqual({
      a: 1,
      b: 2,
      nested: { __id__: 1 },
    });
  });

  it('unwraps a generic Array value', () => {
    const doc = build({
      sharedClasses: [
        ['cc.TestArr', ['mixed'], 3, DataTypeID.Array],
      ],
      sharedMasks: [[0, 0, 1]],
      instances: [
        // Array: [ [items...], ...typesPerItem ]
        [0, [[1, 1, 2], DataTypeID.SimpleType, DataTypeID.InstanceRef, DataTypeID.InstanceRef]],
        [0, 'a', null],
        [0, 'b', null],
      ],
    });
    const out = rehydrateIFileData(doc);
    expect(out[0].mixed).toEqual([1, { __id__: 1 }, { __id__: 2 }]);
  });

  it('preserves RootInfo tail', () => {
    const doc = build({
      sharedClasses: [['cc.Asset', ['_name'], 0]],
      sharedMasks: [[0, 0, 2]],
      instances: [
        [0, 'A'],
        -0,  // RootInfo = 0 (no native dep, root at index 0)
      ],
    });
    const out = rehydrateIFileData(doc);
    // Root info is kept at the end; test that the asset itself is at [0].
    expect(out[0]).toEqual({ __type__: 'cc.Asset', _name: 'A' });
  });

  it('exposes the value-type constructor list', () => {
    expect(VALUE_TYPE_CONSTRUCTORS).toContain('cc.Vec3');
    expect(VALUE_TYPE_CONSTRUCTORS).toContain('cc.Color');
    expect(VALUE_TYPE_CONSTRUCTORS[0]).toBe('cc.Vec2');
  });
});
