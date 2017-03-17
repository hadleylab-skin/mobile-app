import React, { Component } from 'react';
import Baobab from 'baobab';
import _ from 'lodash';

function compareProps(oldProps, newProps) {
    const oldKeys = _.keys(oldProps);
    const newKeys = _.keys(newProps);
    if (oldKeys.length !== newKeys.length) {
        return false;
    }
    return !_.some(oldProps, (oldProp, key) => {
        if (oldProp instanceof Baobab.Cursor) {
            return oldProp.path !== newProps[key].path;
        }
        return !_.isEqual(oldProp, newProps[key]);
    });
}

function initCursor(cursor, schema) {
    if (_.isFunction(schema)) {
        if (!cursor.exists()) {
            schema(cursor);
        }
    } else if (_.isPlainObject(schema) && !_.isArray(schema)) {
        _.each(schema, (childSchema, path) => {
            initCursor(cursor.select(path), childSchema);
        });
    } else if (!cursor.exists()) {
        cursor.set(schema);
    }
}

class TreeStateWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { generationIndex: 1 };
        this.updateGenerationIndex = this.updateGenerationIndex.bind(this);
        this.handleNewCursor = this.handleNewCursor.bind(this);
    }

    handleNewCursor(cursor, cursorName) {
        const schema = this.props.schema[cursorName];
        if (schema) {
            initCursor(cursor, schema);
            cursor.tree.commit();
        }
        cursor.on('update', this.updateGenerationIndex);
    }

    componentWillMount() {
        _.each(this.props.parentProps, (prop, propName) => {
            if (prop instanceof Baobab.Cursor) {
                this.handleNewCursor(prop, propName);
           }
        });
    }

    componentWillReceiveProps(props) {
        _.each(props.parentProps, (prop, propName) => {
            if (prop instanceof Baobab.Cursor) {
                const oldProp = this.props.parentProps[propName];
                if (oldProp.path !== prop.path) {
                    oldProp.off('update', this.updateGenerationIndex);
                    this.handleNewCursor(prop, propName);
                }
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        const isPropsEqual = compareProps(this.props.parentProps, nextProps.parentProps);
        const isStateEqual = _.isEqual(this.state, nextState);
        return !(isPropsEqual && isStateEqual);
    }

    componentWillUnmount() {
        _.each(this.props.parentProps, (cursor) => {
            if (cursor instanceof Baobab.Cursor) {
                cursor.off('update', this.updateGenerationIndex);
            }
        });
    }

    updateGenerationIndex() {
        this.setState({ generationIndex: this.state.generationIndex + 1 });
    }

    render() {
        const ChildComponent = this.props.component;
        return (
            <ChildComponent {...this.props.parentProps} />
        );
    }
}


export default (model) => (component) => {
    function _Component(props, context) {
        const schema = _.isFunction(model) ? model(props, context) : model;
        return (
            <TreeStateWrapper
                schema={schema}
                component={component}
                parentProps={props}
            />
        );
    }
    _Component.contextTypes = component.contextTypes;
    return _Component;
};
