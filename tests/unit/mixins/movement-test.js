import Ember from 'ember';
import MovementMixin from 'pac-man/mixins/movement';
import { module, test } from 'qunit';

module('Unit | Mixin | movement');

// Replace this with your real tests.
test('it works', function(assert) {
  let MovementObject = Ember.Object.extend(MovementMixin);
  let subject = MovementObject.create();
  assert.ok(subject);
});
