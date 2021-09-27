import { mount, createLocalVue } from '@vue/test-utils'
import TodoApp from '@/components/TodoApp/index.vue'
import VueRouter from 'vue-router'
import Vue from 'vue'
const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter({
  linkActiveClass: 'selected'
})
/** @type {import('@vue/test-utils').Wrapper}} */
let wrapper = null
beforeEach(() => {
  wrapper = mount(TodoApp, {
    localVue,
    router
  })
})

describe('添加任务', () => {
  test('在输入框中输入内容敲回车,应该添加任务到列表中,输入框内容应该被清空', async () => {
    // 找到输入框
    const input = wrapper.find('input[data-testid="new-todo"]')
    // 输入内容
    const text = 'hello world'
    await input.setValue(text)
    // 敲回车
    await input.trigger('keyup.enter')
    // 结果: 内容被添加到列表中
    expect(wrapper.find('[data-testid="todo-item"]')).toBeTruthy()
    expect(wrapper.find('[data-testid="todo-text"]').text()).toBe(text)
    expect(input.element.value).toBe('')
  })
})

describe('删除任务', () => {
  test('点击任务项中的删除按钮,任务应该被删除', async () => {
    // 准备测试环境数据
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: false }
      ]
    })
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    // 找到任务项删除按钮
    const delButton = wrapper.find('[data-testid="delete"]')
    // 删除之前存在
    expect(todoItem.exists()).toBeTruthy()
    // 点击删除按钮
    await delButton.trigger('click')
    // 结果: 删除按钮所在的任务项应该被移除
    expect(todoItem.exists()).toBeFalsy()
  })
})

describe('切换单个任务完成状态', () => {
  test('选中任务完成状态按钮,任务的样式变成已完成状态', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: false }
      ]
    })
    const todoDone = wrapper.find('[data-testid="todo-done"]')
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    // 初始未选中
    expect(todoDone.element.checked).toBeFalsy()
    // 初始没有完成样式
    expect(todoItem.classes('completed')).toBeFalsy()
    await todoDone.setChecked()
    expect(todoDone.element.checked).toBeTruthy()
    expect(todoItem.classes('completed')).toBeTruthy()
  })
  test('取消选中任务完成状态按钮,任务的样式变成未完成状态', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true }
      ]
    })
    const todoDone = wrapper.find('[data-testid="todo-done"]')
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    // 初始选中
    expect(todoDone.element.checked).toBeTruthy()
    // 初始完成样式
    expect(todoItem.classes('completed')).toBeTruthy()
    await todoDone.setChecked(false)
    expect(todoDone.element.checked).toBeFalsy()
    expect(todoItem.classes('completed')).toBeFalsy()
  })
})

describe('切换所有任务的完成状态', () => {
  test('选中切换所有按钮,所有的任务应该变成已完成状态', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: false },
        { id: 2, text: 'play', done: false },
        { id: 3, text: 'run', done: false }
      ]
    })
    const toggleAll = wrapper.find('[data-testid="toggle-all"]')
    const todoDoneList = wrapper.findAll('[data-testid="todo-done"]')
    expect(toggleAll.element.checked).toBeFalsy()
    await toggleAll.setChecked()
    for(let i = 0; i < todoDoneList.length; i++) {
      expect(todoDoneList.at(i).element.checked).toBeTruthy()
    }
  })
  test('取消选中切换所有按钮,所有的任务应该变成未完成', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true },
        { id: 2, text: 'play', done: true },
        { id: 3, text: 'run', done: true }
      ]
    })
    const toggleAll = wrapper.find('[data-testid="toggle-all"]')
    const todoDoneList = wrapper.findAll('[data-testid="todo-done"]')
    expect(toggleAll.element.checked).toBeTruthy()
    await toggleAll.setChecked(false)
    for(let i = 0; i < todoDoneList.length; i++) {
      expect(todoDoneList.at(i).element.checked).toBeFalsy()
    }
  })

  test('当所有的任务已完成的时候,全选按钮应该被选中,否则不选中', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true },
        { id: 2, text: 'play', done: false },
        { id: 3, text: 'run', done: true }
      ]
    })
    const toggleAll = wrapper.find('[data-testid="toggle-all"]')
    const todoDoneList = wrapper.findAll('[data-testid="todo-done"]')
    for(let i = 0; i < todoDoneList.length; i++) {
      todoDoneList.at(i).setChecked()
    }
    await Vue.nextTick()
    expect(toggleAll.element.checked).toBeTruthy()
    // 取消选中任意选项
    await todoDoneList.at(0).setChecked(false)
    // 全选也应该取消选中
    expect(toggleAll.element.checked).toBeFalsy()
  })
})

describe('编辑任务', () => {
  test('双击任务项文本,应该获得编辑状态', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true }
      ]
    })
    const todoText = wrapper.find('[data-testid="todo-text"]')
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    expect(todoItem.classes('editing')).toBeFalsy()
    await todoText.trigger('dblclick')
    // 双击后获得编辑状态
    expect(todoItem.classes('editing')).toBeTruthy()
  })

  test('修改任务项文本敲回车后, 应该保存以及取消编辑状态', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true }
      ]
    })
    const todoText = wrapper.find('[data-testid="todo-text"]')
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    const todoEdit = wrapper.find('[data-testid="todo-edit"]')
    const text = 'play'
    // 双击编辑框
    todoText.trigger('dblclick')
    // 修改任务项文本
    todoEdit.setValue(text)
    // 按下回车保存
    todoEdit.trigger('keyup.enter')
    await Vue.nextTick()
    expect(todoItem.classes('editing')).toBeFalsy()
    expect(todoText.text()).toBe(text)
  })

  test('清空任务项文本,保存编辑应该删除任务项', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true }
      ]
    })
    const todoText = wrapper.find('[data-testid="todo-text"]')
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    const todoEdit = wrapper.find('[data-testid="todo-edit"]')
    // 双击编辑框
    todoText.trigger('dblclick')
    // 修改任务项文本
    todoEdit.setValue('')
    // 按下回车保存
    todoEdit.trigger('keyup.enter')
    await Vue.nextTick()
    expect(todoItem.exists()).toBeFalsy()
  })

  test('修改任务项文本按下ESC后,应该取消编辑状态以及任务项文本保持不变', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true }
      ]
    })
    const todoText = wrapper.find('[data-testid="todo-text"]')
    const todoItem = wrapper.find('[data-testid="todo-item"]')
    const todoEdit = wrapper.find('[data-testid="todo-edit"]')
    // 双击编辑框
    todoText.trigger('dblclick')
    // 修改任务项文本
    const originText = todoText.text()
    todoEdit.setValue('')
    // 按下回车保存
    todoEdit.trigger('keyup.esc')
    await Vue.nextTick()
    // 取消保存, 文本不变,任务项还在,并且取消编辑状态
    expect(todoItem.exists()).toBeTruthy()
    expect(todoText.text()).toBe(originText)
    expect(todoItem.classes('editing')).toBeFalsy()
  })
})

describe('删除所有已完成任务项', () => {
  test('如果所有任务未完成,删除按钮应该不展示,否则展示', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: false },
        { id: 2, text: 'eat', done: false }
      ]
    })
    const todoDoneList = wrapper.findAll('[data-testid="todo-done"]')
    expect(wrapper.find('[data-testid="clear-completed"]').exists()).toBeFalsy()
    // 设置某个任务为完成状态
    await todoDoneList.at(0).setChecked()
    expect(wrapper.find('[data-testid="clear-completed"]').exists()).toBeTruthy()
  })

  test('点击清除按钮,应该删除所有已完成任务', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true },
        { id: 2, text: 'play', done: false }
      ]
    })
    const clearCompleted = wrapper.find('[data-testid="clear-completed"]')
    // 点击清除按钮
    await clearCompleted.trigger('click')
    // 任务列表只剩一个
    const todoItems = wrapper.findAll('[data-testid="todo-item"]')
    expect(todoItems.length).toBe(1)
    expect(todoItems.at(0).text()).toBe('play')
    // 查找某个元素时需要重新获取实时的数据 
    expect(wrapper.find('[data-testid="clear-completed"]').exists()).toBeFalsy()
  })
})

describe('展示剩余任务的数量', () => {
  test('展示所有剩余未完成任务数量', async () => {
    await wrapper.setData({
      todos: [
        { id: 1, text: 'eat', done: true },
        { id: 2, text: 'play', done: true }
      ]
    })
    const getDoneTodoSCount = () => {
      const todoDoneList = wrapper.findAll('[data-testid="todo-done"]')
      let count = 0
      for(let i = 0; i < todoDoneList.length; i++) {
        if(!todoDoneList.at(i).element.checked) {
          count++
        }
      }
      return count
    }
    const todoCount = wrapper.find('[data-testid="done-todos-count"]')
    expect(todoCount.text()).toBe(getDoneTodoSCount().toString())
    await wrapper.find('[data-testid="delete"]').trigger('click')
    expect(todoCount.text()).toBe(getDoneTodoSCount().toString())
  })
})

describe('数据筛选', () => {
  const todos = [
    { id: 1, text: 'eat', done: true },
    { id: 2, text: 'play', done: true },
    { id: 3, text: 'play', done: false },
  ]

  const filterTodoS = {
    all() {
      return todos
    },
    active () {
      return todos.filter(todo => !todo.done)
    },
    completed() {
      return todos.filter(todo => todo.done)
    }
  }
  test('点击all 链接,应该展示所有任务,并且all链接应该高亮', async () => {
    wrapper.setData({
      todos
    })
    router.push('/')
    await Vue.nextTick()
    expect(wrapper.find('[data-testid="link-all"]').classes('selected')).toBeTruthy()
    expect(wrapper.findAll('[data-testid="todo-item"]').length).toBe(filterTodoS.all().length)
  })

  test('点击active链接, 应该展示所有未完成任务, 并且active链接应该高亮', async () => {
    wrapper.setData({
      todos
    })
    router.push('/active')
    await Vue.nextTick()
    expect(wrapper.find('[data-testid="link-active"]').classes('selected')).toBeTruthy()
    expect(wrapper.findAll('[data-testid="todo-item"]').length).toBe(filterTodoS.active().length)
  })
  
  test('点击completed链接, 应该展示所有完成任务, 并且completed链接应该高亮', async () => {
    wrapper.setData({
      todos
    })
    router.push('/completed')
    await Vue.nextTick()
    expect(wrapper.find('[data-testid="link-completed"]').classes('selected')).toBeTruthy()
    expect(wrapper.findAll('[data-testid="todo-item"]').length).toBe(filterTodoS.completed().length)
  })
})