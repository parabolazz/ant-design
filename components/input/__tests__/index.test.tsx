import React, { useState } from 'react';
import { mount } from 'enzyme';
import { createPortal } from 'react-dom';
import { render, fireEvent } from '../../../tests/utils';
// eslint-disable-next-line import/no-unresolved
import Form from '../../form';
import Input, { InputProps, InputRef } from '..';
import mountTest from '../../../tests/shared/mountTest';
import rtlTest from '../../../tests/shared/rtlTest';

describe('Input', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    errorSpy.mockReset();
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  mountTest(Input);
  mountTest(Input.Group);

  rtlTest(Input);
  rtlTest(Input.Group);

  it('should support maxLength', () => {
    const wrapper = mount(<Input maxLength={3} />);
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('select()', () => {
    const ref = React.createRef<InputRef>();
    mount(<Input ref={ref} />);
    ref.current?.select();
  });

  it('should support size', () => {
    const wrapper = mount(<Input size="large" />);
    expect(wrapper.find('input').hasClass('ant-input-lg')).toBe(true);
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('should support size in form', () => {
    const wrapper = mount(
      <Form size="large">
        <Form.Item>
          <Input />
        </Form.Item>
      </Form>,
    );
    expect(wrapper.find('input').hasClass('ant-input-lg')).toBe(true);
    expect(wrapper.render()).toMatchSnapshot();
  });

  describe('focus trigger warning', () => {
    it('not trigger', () => {
      const { container, rerender } = render(<Input suffix="bamboo" />);

      fireEvent.focus(container.querySelector('input')!);

      rerender(<Input suffix="light" />);
      expect(errorSpy).not.toHaveBeenCalled();
    });
    it('trigger warning', () => {
      const wrapper = mount(<Input />);
      wrapper.find('input').first().getDOMNode<HTMLInputElement>().focus();
      wrapper.setProps({
        suffix: 'light',
      });
      expect(errorSpy).toHaveBeenCalledWith(
        'Warning: [antd: Input] When Input is focused, dynamic add or remove prefix / suffix will make it lose focus caused by dom structure change. Read more: https://ant.design/components/input/#FAQ',
      );
      wrapper.unmount();
    });
  });

  describe('click focus', () => {
    it('click outside should also get focus', () => {
      const { container } = render(<Input suffix={<span className="test-suffix" />} />);
      const onFocus = jest.spyOn(container.querySelector('input')!, 'focus');
      fireEvent.mouseDown(container.querySelector('.test-suffix')!);
      fireEvent.mouseUp(container.querySelector('.test-suffix')!);
      expect(onFocus).toHaveBeenCalled();
    });

    it('not get focus if out of component', () => {
      const holder = document.createElement('span');
      document.body.appendChild(holder);

      const Popup = () => createPortal(<span className="popup" />, holder);

      const { container } = render(
        <Input
          suffix={
            <span className="test-suffix">
              <Popup />
            </span>
          }
        />,
      );

      const onFocus = jest.spyOn(container.querySelector('input')!, 'focus');
      fireEvent.mouseDown(document.querySelector('.popup')!);
      fireEvent.mouseUp(document.querySelector('.popup')!);

      expect(onFocus).not.toHaveBeenCalled();
      document.body.removeChild(holder);
    });
  });

  it('set mouse cursor position', () => {
    const defaultValue = '11111';
    const valLength = defaultValue.length;
    const ref = React.createRef<InputRef>();
    const wrapper = mount(<Input ref={ref} autoFocus defaultValue={defaultValue} />);
    ref.current?.setSelectionRange(valLength, valLength);
    expect(wrapper.find('input').first().getDOMNode<HTMLInputElement>().selectionStart).toEqual(5);
    expect(wrapper.find('input').first().getDOMNode<HTMLInputElement>().selectionEnd).toEqual(5);
  });
});

describe('prefix and suffix', () => {
  it('should support className when has suffix', () => {
    const { container } = render(<Input suffix="suffix" className="my-class-name" />);
    expect((container.firstChild as Element).className.includes('my-class-name')).toBe(true);
    expect(container.querySelector('input')?.className.includes('my-class-name')).toBe(false);
  });

  it('should support className when has prefix', () => {
    const { container } = render(<Input prefix="prefix" className="my-class-name" />);
    expect((container.firstChild as Element).className.includes('my-class-name')).toBe(true);
    expect(container.querySelector('input')?.className.includes('my-class-name')).toBe(false);
  });

  it('should support hidden when has prefix or suffix', () => {
    const { container } = render(
      <>
        <Input prefix="prefix" hidden className="prefix-with-hidden" />
        <Input suffix="suffix" hidden className="suffix-with-hidden" />
      </>,
    );

    expect(container.querySelector('.prefix-with-hidden')?.getAttribute('hidden')).toBe('');
    expect(container.querySelector('.suffix-with-hidden')?.getAttribute('hidden')).toBe('');
  });
});

describe('Input setting hidden', () => {
  it('should support hidden when has prefix or suffix or showCount or allowClear or addonBefore or addonAfter', () => {
    const { container } = render(
      <>
        <Input
          hidden
          className="input"
          showCount
          allowClear
          prefix="11"
          suffix="22"
          addonBefore="http://"
          addonAfter=".com"
          defaultValue="mysite1"
        />
        <Input.Search
          hidden
          className="input-search"
          showCount
          allowClear
          prefix="11"
          suffix="22"
          addonBefore="http://"
          addonAfter=".com"
          defaultValue="mysite1"
        />
        <Input.TextArea
          hidden
          className="input-textarea"
          showCount
          allowClear
          prefix="11"
          // @ts-ignore
          suffix="22"
          addonBefore="http://"
          addonAfter=".com"
          defaultValue="mysite1"
        />
        <Input.Password
          hidden
          className="input-password"
          showCount
          allowClear
          prefix="11"
          suffix="22"
          addonBefore="http://"
          addonAfter=".com"
          defaultValue="mysite1"
        />
      </>,
    );

    expect(container.querySelector('.input')?.getAttribute('hidden')).toBe('');
    expect(container.querySelector('.input-search')?.getAttribute('hidden')).toBe('');
    expect(container.querySelector('.input-textarea')?.getAttribute('hidden')).toBe('');
    expect(container.querySelector('.input-password')?.getAttribute('hidden')).toBe('');
  });
});

describe('As Form Control', () => {
  it('should be reset when wrapped in form.getFieldDecorator without initialValue', () => {
    const Demo = () => {
      const [form] = Form.useForm();
      const reset = () => {
        form.resetFields();
      };

      return (
        <Form form={form}>
          <Form.Item name="input">
            <Input />
          </Form.Item>
          <Form.Item name="textarea">
            <Input.TextArea />
          </Form.Item>
          <button type="button" onClick={reset}>
            reset
          </button>
        </Form>
      );
    };

    const wrapper = mount(<Demo />);
    wrapper.find('input').simulate('change', { target: { value: '111' } });
    wrapper.find('textarea').simulate('change', { target: { value: '222' } });
    expect(wrapper.find('input').prop('value')).toBe('111');
    expect(wrapper.find('textarea').prop('value')).toBe('222');
    wrapper.find('button').simulate('click');
    expect(wrapper.find('input').prop('value')).toBe('');
    expect(wrapper.find('textarea').prop('value')).toBe('');
  });
});

describe('should support showCount', () => {
  it('maxLength', () => {
    const wrapper = mount(<Input maxLength={5} showCount value="12345" />);
    expect(wrapper.find('input').prop('value')).toBe('12345');
    expect(wrapper.find('.ant-input-show-count-suffix').getDOMNode().innerHTML).toBe('5 / 5');
  });

  it('control exceed maxLength', () => {
    const wrapper = mount(<Input maxLength={5} showCount value="12345678" />);
    expect(wrapper.find('input').prop('value')).toBe('12345678');
    expect(wrapper.find('.ant-input-show-count-suffix').getDOMNode().innerHTML).toBe('8 / 5');
  });

  describe('emoji', () => {
    it('should minimize value between emoji length and maxLength', () => {
      const wrapper = mount(<Input maxLength={1} showCount value="👀" />);
      expect(wrapper.find('input').prop('value')).toBe('👀');
      expect(wrapper.find('.ant-input-show-count-suffix').getDOMNode().innerHTML).toBe('1 / 1');

      const wrapper1 = mount(<Input maxLength={2} showCount value="👀" />);
      expect(wrapper1.find('.ant-input-show-count-suffix').getDOMNode().innerHTML).toBe('1 / 2');
    });

    it('slice emoji', () => {
      const wrapper = mount(<Input maxLength={5} showCount value="1234😂" />);
      expect(wrapper.find('input').prop('value')).toBe('1234😂');
      expect(wrapper.find('.ant-input-show-count-suffix').getDOMNode().innerHTML).toBe('5 / 5');
    });
  });

  it('count formatter', () => {
    const wrapper = mount(
      <Input
        maxLength={5}
        showCount={{ formatter: ({ count, maxLength }) => `${count}, ${maxLength}` }}
        value="12345"
      />,
    );
    expect(wrapper.find('input').prop('value')).toBe('12345');
    expect(wrapper.find('.ant-input-show-count-suffix').getDOMNode().innerHTML).toBe('5, 5');
  });
});

describe('Input allowClear', () => {
  it('should change type when click', () => {
    const wrapper = mount(<Input allowClear />);
    wrapper.find('input').simulate('change', { target: { value: '111' } });
    expect(wrapper.find('input').getDOMNode<HTMLInputElement>().value).toEqual('111');
    expect(wrapper.render()).toMatchSnapshot();
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(wrapper.render()).toMatchSnapshot();
    expect(wrapper.find('input').getDOMNode<HTMLInputElement>().value).toEqual('');
  });

  it('should not show icon if value is undefined, null or empty string', () => {
    // @ts-ignore
    const wrappers = [null, undefined, ''].map(val => mount(<Input allowClear value={val} />));
    wrappers.forEach(wrapper => {
      expect(wrapper.find('input').getDOMNode<HTMLInputElement>().value).toEqual('');
      expect(wrapper.find('.ant-input-clear-icon-hidden').exists()).toBeTruthy();
      expect(wrapper.render()).toMatchSnapshot();
    });
  });

  it('should not show icon if defaultValue is undefined, null or empty string', () => {
    const wrappers = [null, undefined, ''].map(val =>
      // @ts-ignore
      mount(<Input allowClear defaultValue={val} />),
    );
    wrappers.forEach(wrapper => {
      expect(wrapper.find('input').getDOMNode<HTMLInputElement>().value).toEqual('');
      expect(wrapper.find('.ant-input-clear-icon-hidden').exists()).toBeTruthy();
      expect(wrapper.render()).toMatchSnapshot();
    });
  });

  it('should trigger event correctly', () => {
    let argumentEventObject: React.ChangeEvent<HTMLInputElement> | undefined;

    let argumentEventObjectValue;
    const onChange: InputProps['onChange'] = e => {
      argumentEventObject = e;
      argumentEventObjectValue = e.target.value;
    };
    const wrapper = mount(<Input allowClear defaultValue="111" onChange={onChange} />);
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(argumentEventObject?.type).toBe('click');
    expect(argumentEventObjectValue).toBe('');
    expect(wrapper.find('input').at(0).getDOMNode<HTMLInputElement>().value).toBe('');
  });

  it('should trigger event correctly on controlled mode', () => {
    let argumentEventObject: React.ChangeEvent<HTMLInputElement> | undefined;
    let argumentEventObjectValue;
    const onChange: InputProps['onChange'] = e => {
      argumentEventObject = e;
      argumentEventObjectValue = e.target.value;
    };
    const wrapper = mount(<Input allowClear value="111" onChange={onChange} />);
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(argumentEventObject?.type).toBe('click');
    expect(argumentEventObjectValue).toBe('');
    expect(wrapper.find('input').at(0).getDOMNode<HTMLInputElement>().value).toBe('111');
  });

  it('should focus input after clear', () => {
    const wrapper = mount(<Input allowClear defaultValue="111" />, { attachTo: document.body });
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(document.activeElement).toBe(wrapper.find('input').at(0).getDOMNode());
    wrapper.unmount();
  });

  ['disabled', 'readOnly'].forEach(prop => {
    it(`should not support allowClear when it is ${prop}`, () => {
      const wrapper = mount(<Input allowClear defaultValue="111" {...{ [prop]: true }} />);
      expect(wrapper.find('.ant-input-clear-icon-hidden').exists()).toBeTruthy();
    });
  });

  // https://github.com/ant-design/ant-design/issues/27444
  it('should support className', () => {
    const { container } = render(<Input allowClear className="my-class-name" />);
    expect((container.firstChild as Element).className.includes('my-class-name')).toBe(true);
    expect(container.querySelector('input')?.className.includes('my-class-name')).toBe(false);
  });

  // https://github.com/ant-design/ant-design/issues/31200
  it('should not lost focus when clear input', () => {
    const onBlur = jest.fn();
    const wrapper = mount(<Input allowClear defaultValue="value" onBlur={onBlur} />, {
      attachTo: document.body,
    });
    wrapper.find('input').getDOMNode<HTMLInputElement>().focus();
    wrapper.find('.ant-input-clear-icon').at(0).simulate('mouseDown');
    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    wrapper.find('.ant-input-clear-icon').at(0).simulate('mouseUp');
    wrapper.find('.ant-input-clear-icon').at(0).simulate('focus');
    wrapper.find('.ant-input-clear-icon').at(0).getDOMNode<HTMLInputElement>().click();
    expect(onBlur).not.toBeCalled();
    wrapper.unmount();
  });

  // https://github.com/ant-design/ant-design/issues/31927
  it('should correctly when useState', () => {
    const App = () => {
      const [query, setQuery] = useState('');
      return (
        <Input
          allowClear
          value={query}
          onChange={e => {
            setQuery(() => e.target.value);
          }}
        />
      );
    };

    const wrapper = mount(<App />);

    wrapper.find('input').getDOMNode<HTMLInputElement>().focus();
    wrapper.find('input').simulate('change', { target: { value: '111' } });
    expect(wrapper.find('input').getDOMNode<HTMLInputElement>().value).toEqual('111');

    wrapper.find('.ant-input-clear-icon').at(0).simulate('click');
    expect(wrapper.find('input').getDOMNode<HTMLInputElement>().value).toEqual('');

    wrapper.unmount();
  });

  it('not crash when value is number', () => {
    const wrapper = mount(<Input suffix="Bamboo" value={1} />);
    expect(wrapper).toBeTruthy();
  });

  it('should display boolean value as string', () => {
    // @ts-ignore
    const wrapper = mount(<Input value />);
    expect(wrapper.find('input').first().getDOMNode<HTMLInputElement>().value).toBe('true');
    wrapper.setProps({ value: false });
    expect(wrapper.find('input').first().getDOMNode<HTMLInputElement>().value).toBe('false');
  });

  it('should support custom clearIcon', () => {
    const wrapper = mount(<Input allowClear={{ clearIcon: 'clear' }} />);
    expect(wrapper.find('.ant-input-clear-icon').text()).toBe('clear');
  });
});

describe('typescript types ', () => {
  it('InputProps type should support data-* attributes', () => {
    const props: InputProps = {
      value: 123,

      // expect no ts error here
      'data-testid': 'test-id',
      'data-id': '12345',
    };
    const wrapper = mount(<Input {...props} />);
    const input = wrapper.find('input').first().getDOMNode();
    expect(input.getAttribute('data-testid')).toBe('test-id');
    expect(input.getAttribute('data-id')).toBe('12345');
  });
});
