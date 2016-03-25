import ava from 'ava';
import postcss from 'postcss';
import plugin from '..';
import {name} from '../../package.json';

const tests = [{
    message: 'should remove empty @ rules',
    fixture: '@font-face;',
    expected: ''
}, {
    message: 'should remove empty @ rules (2)',
    fixture: '@font-face {}',
    expected: ''
}, {
    message: 'should not mangle @ rules with decls',
    fixture: '@font-face {font-family: Helvetica}',
    expected: '@font-face {font-family: Helvetica}'
}, {
    message: 'should not mangle @ rules with parameters',
    fixture: '@charset "utf-8";',
    expected: '@charset "utf-8";'
}, {
    message: 'should remove empty rules',
    fixture: 'h1{}h2{}h4{}h5,h6{}',
    expected: ''
}, {
    message: 'should remove empty declarations',
    fixture: 'h1{color:}',
    expected: ''
}, {
    message: 'should remove null selectors',
    fixture: '{color:blue}',
    expected: ''
}, {
    message: 'should remove null selectors in media queries',
    fixture: '@media screen, print {{}}',
    expected: ''
}, {
    message: 'should remove empty media queries',
    fixture: '@media screen, print {h1,h2{}}',
    expected: ''
}, {
    message: 'should not be responsible for removing comments',
    fixture: 'h1{/*comment*/}',
    expected: 'h1{/*comment*/}'
}, {
    message: 'should report removed selectors',
    fixture: 'h1{}.hot{}.a.b{}{}@media secreen, print{h1,h2{}}',
    expected: '',
    removedSelectors: ['h1', '.hot', '.a.b', '', 'h1,h2']
}];

tests.forEach(test => {
    ava(test.message, t => {
        const out = postcss(plugin(test.options || {})).process(test.fixture);
        t.same(out.css, test.expected);

        if (test.removedSelectors) {
            testRemovals(t, test, out);
        }
    });
});

ava('should use the postcss plugin api', t => {
    t.ok(plugin().postcssVersion, 'should be able to access version');
    t.same(plugin().postcssPlugin, name, 'should be able to access name');
});

function testRemovals (t, test, out) {
    const message = out.messages.find((m) =>
        m.plugin === 'postcss-discard-empty' && m.type === 'selectors'
    );

    const selectors = message.selectors;

    test.removedSelectors.forEach((selector) => {
        const i = selectors.indexOf(selector);

        if (i === -1) {
            t.fail('expected selector `' + selector + '` was not removed');
        } else {
            selectors.splice(i, 1);
        }
    });

    selectors.forEach((selector) => {
        t.fail('unexpected selector `' + selector + '` was removed');
    });
}
