import { FormFieldUtils } from './page';
import { RequestCatalogItemUtils } from './page';

describe('FormFieldUtils', () => {
  test('validate handles invalid regex patterns gracefully', () => {
    const field = {
      name: 'testField',
      label: 'Test Field',
      type: 'string',
      required: true,
      validation: '[invalid-regex',
    };
    const value = 'test';

    const result = FormFieldUtils.validate(field, value);
    expect(result).toBe(false);
  });

  test('getDefaultValue provides fallback for unsupported field types', () => {
    const field = {
      name: 'unsupportedField',
      label: 'Unsupported Field',
      type: 'unsupported',
      required: false,
    };

    const defaultValue = FormFieldUtils.getDefaultValue(field);
    expect(defaultValue).toBe('');
  });
});

describe('RequestCatalogItemUtils', () => {
  test('getTagList returns default message for empty tags', () => {
    const item = {
      id: '1',
      name: 'Test Item',
      description: 'A test item',
      category: 'Test',
      tags: [],
    };

    const tagList = RequestCatalogItemUtils.getTagList(item);
    expect(tagList).toBe('No tags available');
  });

  test('getTagList joins tags correctly', () => {
    const item = {
      id: '1',
      name: 'Test Item',
      description: 'A test item',
      category: 'Test',
      tags: ['tag1', 'tag2'],
    };

    const tagList = RequestCatalogItemUtils.getTagList(item);
    expect(tagList).toBe('tag1, tag2');
  });
});
