let _Vue = null
class VueRouter {
	static install(vue) {
		// 1.判断当前插件是否被安装
		if (VueRouter.install.installed) return
		VueRouter.install.installed = true
		// 2. 把vue的构造函数记录在全局
		_Vue = vue
		// 3.把创建的vue实例传入的router对象注入到vue实例
		_Vue.mixin({
			beforeCreate() {
				// vuerouter只需要挂载到vue对象中,其他vue组件不需要
				// this.$options.router是vue对象专属属性
				if (this.$options.router) {
					_Vue.prototype.$router = this.$options.router
				}
			}
		})
	}
	constructor(options) {
		this.options = options
		this.routeMap = {}
		// 响应式对象(通过observable实现),记录当前路由地址
		this.data = _Vue.observable({
			current: '/'
		})
		this.init()
	}
	init() {
		this.createRouteMap()
		this.initComponent(_Vue)
		this.initEvent()
	}
	createRouteMap() {
		//遍历所有的路由规则 吧路由规则解析成键值对的形式存储到routeMap中
		this.options.routes.forEach(route => {
			this.routeMap[route.path] = route.component
		});
	}
	initComponent(Vue) {
		Vue.component('router-link', {
			props: {
				to: String
			},
			// // 该写法需要用完整版vue,运行版本没有编译器
			// template: '<a :href="to"><slot/></a>'
			render(h) {
				return h('a', {
					attrs: {
						href: this.to
					},
					on: {
						click: this.clickHandler
					}
				}, [this.$slots.default])
			},
			methods: {
				clickHandler(e) {
					// 给浏览器增加记录,改变地址
					history.pushState({}, "", this.to)
					// 加载对应的路由组件
					// 1. this指向routerlink组件,是一个vue实例
					// 2. $router.data.current在constructor注册,已经挂载到vue原型上
					// 3. data是一个响应式对象, 改变后会重新加载对应组件
					this.$router.data.current = this.to
					e.preventDefault()
				}
			}
		})

		const self = this;
		Vue.component('router-view', {
			render(h) {
				const component = self.routeMap[self.data.current]
				return h(component)
			}
		})
	}
	initEvent() {
		window.addEventListener('popstate', () => {
			// 箭头函数的this, 谁调用归谁(initEvent是vueRouter实例中方法, 所以指向vueRouter) 
			this.data.current = window.location.pathname
		})
	}
}
module.exports = VueRouter