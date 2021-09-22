import { shallowMount } from '@vue/test-utils'
import TodoHeader from '@/components/TodoApp/TodoHeader'
describe('TOdoHeader.vue', () => {
  let wrapper = null
  beforeEach(() => {
    wrapper = shallowMount(TodoHeader)
  })
  test('New todo', async () => {
    const input = wrapper.find('input[data-testid="new-todo"]')
    const text = 'todo' 
    await input.setValue(text)
    await input.trigger('keyup.enter')
    expect(wrapper.emitted()['new-todo']).toBeTruthy()
    expect(wrapper.emitted()['new-todo'][0][0]).toBe(text)
    expect(input.element.value).toBe('')
  })

  test('New todo with empty text', () => {
    const input = wrapper.find('input[data-testid="new-todo"]')
    const text = ''
    input.setValue(text)
    input.trigger('keyup.enter')
    expect(wrapper.emitted('new-todo')).toBeFalsy()
  })
})