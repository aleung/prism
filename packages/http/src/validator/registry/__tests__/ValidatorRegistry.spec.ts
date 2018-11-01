import { ISchema } from '@stoplight/types/schema';

import { ISchemaValidator } from '../types';
import { ValidatorRegistry } from '../ValidatorRegistry';

describe('ValidatorRegistry', () => {
  const mockValidator = { supports: jest.fn(), validate: jest.fn() } as ISchemaValidator<ISchema>;
  const validatorRegistry = new ValidatorRegistry([mockValidator]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validator for given media type exists', () => {
    it('returns validation closure', () => {
      spyOn(mockValidator, 'supports').and.returnValue(true);
      spyOn(mockValidator, 'validate');

      const validate = validatorRegistry.get('application/json');
      expect(validate).toEqual(expect.any(Function));

      if (!validate) {
        throw new Error('Expectation failed');
      }

      validate('content', {});

      expect(mockValidator.validate).toHaveBeenCalled();
      expect(mockValidator.validate).toHaveBeenCalledWith('content', {});
    });
  });

  describe('validator for given media type does not exists', () => {
    it('returns undefined', () => {
      spyOn(mockValidator, 'supports').and.returnValue(false);
      expect(validatorRegistry.get('application/json')).toBeUndefined();
    });
  });
});
