import { ValidationSeverity } from '@stoplight/prism-core';
import { ISchema } from '@stoplight/types/schema';

import { IValidatorRegistry } from '../../registry/types';
import { HttpBodyValidator } from '../HttpBodyValidator';

describe('HttpBodyValidator', () => {
  const validatorRegistry = { get: () => () => [] } as IValidatorRegistry;
  const httpBodyValidator = new HttpBodyValidator(validatorRegistry);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(validatorRegistry, 'get');
  });

  describe('validate()', () => {
    describe('content specs are missing', () => {
      it('returns no validation errors', () => {
        expect(httpBodyValidator.validate('test', [])).toEqual([]);
        expect(validatorRegistry.get).not.toHaveBeenCalled();
      });
    });

    describe('request media type is not provided', () => {
      it('returns no validation errors', () => {
        expect(
          httpBodyValidator.validate('test', [{ mediaType: 'application/not-exists-son' }])
        ).toEqual([]);
        expect(validatorRegistry.get).not.toHaveBeenCalled();
      });
    });

    describe('request media type was not found in spec', () => {
      it('returns no validation errors', () => {
        expect(
          httpBodyValidator.validate(
            'test',
            [{ mediaType: 'application/not-exists-son' }],
            'application/json'
          )
        ).toEqual([]);
        expect(validatorRegistry.get).not.toHaveBeenCalled();
      });
    });

    describe('body schema is provided', () => {
      describe('validator for given media type does not exists', () => {
        it('return no validation errors', () => {
          jest.spyOn(validatorRegistry, 'get').mockImplementation(mediaType => {
            expect(mediaType).toBe('application/json');
            return;
          });

          expect(
            httpBodyValidator.validate(
              'test',
              [{ mediaType: 'application/json', schema: {} }],
              'application/json'
            )
          ).toEqual([]);

          expect(validatorRegistry.get).toHaveBeenCalledTimes(1);
        });
      });

      describe('validator for given media type exists', () => {
        it('return validation errors', () => {
          const mockSchema = { type: 'string' };

          jest.spyOn(validatorRegistry, 'get').mockImplementation(mediaType => {
            expect(mediaType).toBe('application/json');
            return (content: any, schema: ISchema) => {
              expect(content).toEqual('test');
              expect(schema).toEqual(mockSchema);
              return [
                {
                  path: ['a'],
                  name: 'testName',
                  summary: 'testSummary',
                  severity: ValidationSeverity.ERROR,
                  message: 'testMessage',
                },
              ];
            };
          });

          expect(
            httpBodyValidator.validate(
              'test',
              [{ mediaType: 'application/json', schema: mockSchema }],
              'application/json'
            )
          ).toMatchSnapshot();

          expect(validatorRegistry.get).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
