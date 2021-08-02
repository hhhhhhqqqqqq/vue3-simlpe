import { isObject } from "@vue/shared";
import { effect, track, trigger } from "./effect";

class ComputedRefImpl {
    public effect;
    public _value;
    public _dirty = true;
    constructor(public getter, public setter) {
        // 返回effect的执行权限
        // 传入了schedular 后，下次数据更新，原则上应该让effec重新执行，下次更新会调用schedular
        this.effect = effect(getter, {
            lazy: true, schedular: (effect) => {
                if (!this._dirty) {
                    // 用户修改了依赖的属性
                    this._dirty = true;
                    trigger(this, 'get', 'value')
                }
            }
        })
    }

    get value() {
        if (this._dirty) {
            this._value = this.effect()
            this._dirty = false;
        }
        // 收集计算属性的依赖
        track(this, 'get', 'value')
        return this._value
    }

    set value(newValue) {
        // 当用户给计算属性设置值时会触发，set方法，此时调用计算属性的setter
        this.setter(newValue)
    }
}

export function computed(getterOrOptions) {
    let getter;
    let setter;

    if (isObject(getterOrOptions)) {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    } else {
        getter = getterOrOptions;
        setter = () => {
            console.log(`computed no setter`)
        }
    }

    return new ComputedRefImpl(getter, setter)
}