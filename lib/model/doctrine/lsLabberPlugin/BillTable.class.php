<?php

/**
 * BillTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class BillTable extends PluginBillTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object BillTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('Bill');
    }
}