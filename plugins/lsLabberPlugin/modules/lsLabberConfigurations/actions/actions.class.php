<?php

/**
 * configurations actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberConfigurations
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action configurations
 */
class lsLabberConfigurationsActions extends sfActions
{
 /**
  * Salva le preferenze dell'applicazione
  *
  * TODO: gestire le eccezioni
  *
  * @param sfRequest $request A request object
  * @extdirect-enable
  * @extdirect-len 1
  */
  public function executeSave(sfWebRequest $request)
  {
    $values = $request->getParameter('values');

    $configurationsTable = Doctrine::getTable('Configurations');

    foreach ($values as $k => $v)
    {
      if ($configurationsTable->findOneByName($k))
      {
        $key = $configurationsTable->findOneByName($k);
      } else {
        $key = new Configurations();
        $key->setName($k);
      }

      $key->setValue(json_encode($v));
      $key->save();
    }

    if (function_exists('apc_store'))
    {
      apc_store(sfConfig::get('app_install_id') . '_configurations_dirty_flag', true);
    }

    $this->result = array(
      'success' => true,
      'message' => 'Impostazioni salvate'
    );

    return sfView::SUCCESS;
  }
}
