<?php

/**
 * MethodTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class MethodTable extends PluginMethodTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object MethodTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('Method');
    }
}