import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Truncate extends Component {
    static propTypes = {
        children: PropTypes.node,
        ellipsis: PropTypes.node,
        numChars: PropTypes.oneOfType([
            PropTypes.oneOf([false]),
            PropTypes.number
        ]),
        onTruncate: PropTypes.func
    };

    static defaultProps = {
        children: '',
        ellipsis: '…',
        numChars: 50
    };

    state = {};

    constructor(...args) {
        super(...args);

        this.elements = {};
        this.onTruncate = this.onTruncate.bind(this);
    }

    componentDidUpdate(prevProps) {
        // Render was based on outdated refs and needs to be rerun
        if (this.props.children !== prevProps.children) {
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        const {
            elements: {
                ellipsis
            },
            timeout
        } = this

        ellipsis.parentNode.removeChild(ellipsis);
        window.cancelAnimationFrame(timeout);
    }

    innerText(node) {
        const div = document.createElement('div');
        const contentKey = 'innerText' in window.HTMLElement.prototype ? 'innerText' : 'textContent';

        div.innerHTML = node.innerHTML.replace(/\r\n|\r|\n/g, ' ');

        let text = div[contentKey];

        const test = document.createElement('div');
        test.innerHTML = 'foo<br/>bar';

        if (test[contentKey].replace(/\r\n|\r/g, '\n') !== 'foo\nbar') {
            div.innerHTML = div.innerHTML.replace(/<br.*?[\/]?>/gi, '\n');
            text = div[contentKey];
        }

        return text;
    }

    onTruncate(didTruncate) {
        const {
            onTruncate
        } = this.props;

        if (typeof onTruncate === 'function') {
            this.timeout = window.requestAnimationFrame(() => {
                onTruncate(didTruncate);
            });
        }
    }

    render() {
        const {
            elements: {
                target
            },
            props: {
                children,
                ellipsis,
                numChars,
                ...spanProps
            },
            innerText,
            onTruncate
        } = this;

        let text;

        const mounted = !!target;

        if (typeof window !== 'undefined' && mounted) {
            if (numChars > 0) {
                const truncatedText = innerText(this.elements.text).substring(0, numChars)
                text = <p className="truncated-text">{truncatedText}</p>
                onTruncate(true);
            } else {
                text = children;
                onTruncate(false);
            }
        }

        delete spanProps.onTruncate;

        return (
            <span {...spanProps} ref={(targetEl) => { this.elements.target = targetEl; }}>
                <span>{text}</span>
                <span ref={(textEl) => { this.elements.text = textEl; }}>{children}</span>
                <span ref={(ellipsisEl) => { this.elements.ellipsis = ellipsisEl; }} style={this.styles.ellipsis}>
                    {ellipsis}
                </span>
            </span>
        );
    }

    styles = {
        ellipsis: {
            position: 'fixed',
            visibility: 'hidden',
            top: 0,
            left: 0
        }
    };
};
