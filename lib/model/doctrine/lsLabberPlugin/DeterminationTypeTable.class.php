<?php

/**
 * DeterminationTypeTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class DeterminationTypeTable extends PluginDeterminationTypeTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object DeterminationTypeTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('DeterminationType');
    }
}