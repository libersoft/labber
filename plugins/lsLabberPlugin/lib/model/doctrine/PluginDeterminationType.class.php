<?php

/**
 * This abstract class Pluginhas been auto-generated by the Doctrine ORM Framework
 */
abstract class PluginDeterminationType extends BaseDeterminationType
{
  public function getField(FieldType $fieldType)
  {
    $field = Doctrine_Query::create()
      ->from('DeterminationTypeField')
      ->where('determination_type_id = ?', $this->id)
      ->andWhere('field_type_id = ?', $fieldType->id)
      ->fetchOne();

    if ($field === false)
    {
      $field = new DeterminationTypeField();
      $field->setFieldType($fieldType);
      $field->setDeterminationType($this);
    }

    return $field;
  }

  public function getMethodDepartment()
  {
    return $this->getMethod()->getDepartment();
  }

  public function getMethodOrganization()
  {
    return $this->getMethod()->getOrganization();
  }

  public function getMethodCost()
  {
    return $this->getMethod()->getCost();
  }
}