<?php

/**
 * SampleTypeTable
 * 
 * This class has been auto-generated by the Doctrine ORM Framework
 */
class SampleTypeTable extends PluginSampleTypeTable
{
    /**
     * Returns an instance of this class.
     *
     * @return object SampleTypeTable
     */
    public static function getInstance()
    {
        return Doctrine_Core::getTable('SampleType');
    }
}