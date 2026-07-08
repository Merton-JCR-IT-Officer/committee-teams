import { registerPlugin } from '@wordpress/plugins';

import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { ToggleControl, TextControl, PanelRow, Button } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';


const NpseudoMemberMetaPanelPrewrap = ( { postType, postMeta, setPostMeta } ) => {
	if ( 'npseudo_com_member' !== postType ) return null;  // Will only render component for custom post type

	const hasAttachment = postMeta.attachment && postMeta.attachment.id;

	return(
		<PluginDocumentSettingPanel title={ __( 'Committee Member', 'committee_teams') } icon="edit" initialOpen="true">
			<PanelRow>
				<TextControl
					label={ __( 'Email Address', 'committee_teams' ) }
					value={ postMeta.member_email}
					onChange={ ( value ) => setPostMeta( { member_email: value } ) }
					type={"email"}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={ __( 'Position', 'committee_teams' ) }
					value={ postMeta.position}
					onChange={ ( value ) => setPostMeta( { position: value } ) }
				/>
			</PanelRow>
			<PanelRow>
			<TextControl
				label={ __( 'Pronouns', 'committee_teams' ) }
				value={ postMeta.member_pronouns}
				onChange={ ( value ) => setPostMeta( { member_pronouns: value } ) }

			/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={ __( 'Instagram username', 'committee_teams' ) }
					value={ postMeta.member_instagram}
					onChange={ ( value ) => setPostMeta( { member_instagram: value } ) }
				/>
			</PanelRow>
			<PanelRow>
				<label htmlFor={"attachmentUploadButton"}>Manifesto</label></PanelRow>
			<PanelRow>
				<MediaUploadCheck>
					<MediaUpload
						onSelect={ ( media ) =>
							setPostMeta({
								attachment: {id: media.id, url: media.url, title: media.title}
							})
						}
						value={ postMeta.attachment?.id }
						render={ ( { open } ) => (
							<Button onClick={ open } id={"attachmentUploadButton"}>{hasAttachment ? "Replace": "Select"}</Button>
						) }
					/>
				</MediaUploadCheck>
				{hasAttachment && <><Button onClick={() => setPostMeta( {attachment: null})}>Remove</Button><a href={postMeta.attachment.url} download>{postMeta.attachment.title}</a></>}
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
}

const NpseudoMemberMetaPanel = compose( [
	withSelect( ( select ) => {
		return {
			postMeta: select( 'core/editor' ).getEditedPostAttribute( 'meta' ),
			postType: select( 'core/editor' ).getCurrentPostType(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		return {
			setPostMeta( newMeta ) {
				dispatch( 'core/editor' ).editPost( { meta: newMeta } );
			}
		};
	} )
] )( NpseudoMemberMetaPanelPrewrap );
export default NpseudoMemberMetaPanel;


registerPlugin( 'npseudo-member-meta-plugin', {
	render() {
		return(<NpseudoMemberMetaPanel />);
	}
} );
