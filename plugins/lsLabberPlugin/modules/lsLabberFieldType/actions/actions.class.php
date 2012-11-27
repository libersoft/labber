<?php

/**
 * FieldType related actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberFieldType
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action fieldType
 */
class lsLabberFieldTypeActions extends sfActions
{
  /**
   * Restituisce un array di oggetti collegati ad un parametro.
   *
   * @extdirect-enable
   * @extdirect-len 1
   * @param sfRequest $request A request object
   */
  public function executeGetRelations(sfWebRequest $request)
  {
    try
    {
      $fieldType = Doctrine::getTable('FieldType')
        ->createQuery('ft')
        ->leftJoin('ft.Methods m')
        ->where('ft.id = ?', $request->getParameter('id'))
        ->fetchOne();

      $data = array();

      foreach ($fieldType->getMethods() as $method)
      {
        $data[] = array(
          'class' => 'Metodo',
          'name' => $method->getName()
        );
      }

      $this->result = array(
        'success' => true,
        'data'    => $data
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    return sfView::SUCCESS;
  }
}
