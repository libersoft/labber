<?php

/**
 * LimitsGroup tests.
 */
include dirname(__FILE__).'/../../../../../../test/bootstrap/Doctrine.php';

$t = new lime_test(2);

$t->comment('->getOfficialName()');

$lg = Doctrine::getTable('LimitsGroup')->findOneByName('Tabella 0');
$t->is($lg->getOfficialName(), $lg->getName());

$lg = Doctrine::getTable('LimitsGroup')->findOneByName('Tabella 1');
$t->is($lg->getOfficialName(), $lg->getCertifiedName());
