<?php

abstract class PluginContactAddressTable extends Doctrine_Table {

    public static function getInstance() {
        return Doctrine_Core::getTable('ContactAddress');
    }

    public static function retrieveAddresses(Doctrine_Query $q, $parent_id) {
        $rootAlias = $q->getRootAlias();
        $q->andWhere('parent_id = ?', $parent_id);
        return $q;
    }

}