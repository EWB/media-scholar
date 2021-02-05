<?php

namespace Drupal\gutenberg\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\file\Entity\File;
use Drupal\gutenberg\MediaSelectionProcessor\MediaSelectionProcessorManagerInterface;
use Drupal\gutenberg\Service\FileEntityNotFoundException;
use Drupal\gutenberg\Service\MediaEntityNotFoundException;
use Drupal\gutenberg\Service\MediaService;
use Drupal\gutenberg\Service\MediaTypeNotFoundException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\editor\Entity\Editor;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Returns responses for our image routes.
 */
class MediaController extends ControllerBase {

  /**
   * The media service.
   *
   * @var \Drupal\gutenberg\Service\MediaService
   */
  protected $mediaService;

  /**
   * The media selection processor manager.
   *
   * @var \Drupal\gutenberg\MediaSelectionProcessor\MediaSelectionProcessorManagerInterface
   */
  protected $mediaSelectionProcessorManager;

  /**
   * MediaController constructor.
   *
   * @param \Drupal\gutenberg\Service\MediaService $media_service
   *   The media service.
   * @param \Drupal\gutenberg\MediaSelectionProcessor\MediaSelectionProcessorManagerInterface $media_selection_processor_manager
   *   The media selection processor manager.
   */
  public function __construct(MediaService $media_service, MediaSelectionProcessorManagerInterface $media_selection_processor_manager) {
    $this->mediaService = $media_service;
    $this->mediaSelectionProcessorManager = $media_selection_processor_manager;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('gutenberg.media_service'),
      $container->get('gutenberg.media_selection_processor_manager')
    );
  }

  /**
   * Render Drupal's media library dialog.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   */
  public function dialog(Request $request) {
    try {
      return new JsonResponse([
        'html' => $this->mediaService->renderDialog(
          explode(',', $request->query->get('types', ''))
        ),
      ]);
    }
    catch (MediaTypeNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Load media data.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param string $media
   *   Media data (numeric or stringified JSON for media data processing).
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function loadMedia(Request $request, string $media) {
    $media_entities = $this->mediaSelectionProcessorManager->processData($media);

    try {
      if (!$media_entities) {
        throw new MediaEntityNotFoundException();
      }

      return new JsonResponse($this->mediaService->loadMediaData(reset($media_entities)));
    }
    catch (MediaEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Render provided media entity.
   *
   * @param string $media
   *   Media data (numeric or stringified JSON for media data processing).
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function render(string $media) {
    $media_entities = $this->mediaSelectionProcessorManager->processData($media);

    try {
      if (!$media_entities) {
        throw new MediaEntityNotFoundException();
      }

      $media_entity = reset($media_entities);

      return new JsonResponse([
        'view_modes' => $this->mediaService->getRenderedMediaEntity($media_entity),
        'media_entity' => [
          'id' => $media_entity->id(),
          'type' => $media_entity->bundle(),
        ],
      ]);
    }
    catch (MediaEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Upload files, save as file and media entity if possible.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param \Drupal\editor\Entity\Editor|null $editor
   *   Editor entity instance.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Exception
   */
  public function upload(Request $request, Editor $editor = NULL) {
    $files = $request->files->get('files', []);
    $uploaded_file = $files['fid'] ?? NULL;

    if (!$uploaded_file instanceof UploadedFile) {
      throw new UnprocessableEntityHttpException('Invalid file has been uploaded.');
    }

    try {
      return new JsonResponse($this->mediaService->processMediaEntityUpload($uploaded_file, $editor));
    }
    catch (\Exception $exception) {
      throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, $exception->getMessage(), $exception);
    }
  }

  /**
   * Get data of the media entity required for Gutenberg editor.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param \Drupal\file\Entity\File|null $file
   *   Loaded found file entity instance.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Exception
   */
  public function load(Request $request, File $file = NULL) {
    if (!$file) {
      throw new NotFoundHttpException('File entity not found.');
    }

    try {
      return new JsonResponse($this->mediaService->loadFileData($file));
    }
    catch (FileEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Searches for files.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   * @param string $type
   *   The MIME type search string.
   * @param string $search
   *   The filename search string.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function search(Request $request, string $type = '', string $search = '') {
    return new JsonResponse(
      $this->mediaService->search($request, $type, $search)
    );
  }

  /**
   * Updates file data.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param string|int $fid
   *   File id.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   */
  public function updateData(Request $request, $fid) {
    $data = json_decode($request->getContent(), TRUE);

    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new BadRequestHttpException('Request data could not be parsed.');
    }

    try {
      $this->mediaService->updateMediaData($fid, $data);
    }
    catch (\Throwable $exception) {
      throw new HttpException(Response::HTTP_INTERNAL_SERVER_ERROR, 'Data could not be updated');
    }

    return new JsonResponse(['status' => 'ok']);
  }

  /**
   * Get data for autocomplete.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function autocomplete(Request $request) {
    return new JsonResponse(
      $this->mediaService->getMediaEntityAutoCompleteData($request->get('search', ''))
    );
  }

}
