import {Spinner} from '@wordpress/components';
import {decodeEntities} from '@wordpress/html-entities';
import {forwardRef, useState} from '@wordpress/element';

export const GroupIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
		<path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
		<path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
		<path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
	</svg>);

export const PersonIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
		<path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"/>
	</svg>);

function getFeaturedImageDetails(post, size) {
	const image = post['_embedded']?.['wp:featuredmedia']?.[0];
	return {
		url:
			image?.media_details?.sizes?.[size]?.source_url ??
			image?.source_url,
		alt: image?.alt_text,
	};
}

function MoreInfoItem({ id, children }) {
	const [isExpanded, setIsExpanded] = useState(false);
	return (
		<>
			<a href="#"
			   id={`npseudo-info-toggle-${id}`}
			   role="button"
			   aria-expanded={isExpanded}
			   aria-controls={`npseudo-info-${id}`}
			   onClick={() => {setIsExpanded(!isExpanded); return false;}}
			>More Info</a>
			<section className="npseudo-member-bio"
					 id={`npseudo-info-${id}`}
					 aria-labelledby={`npseudo-info-toggle-${id}`}
					 hidden={!isExpanded}>{children}</section>
		</>
	)
}

function RawMember({member, children, ...props}, ref) {
	if (!member) {
		return <p>Member not found.</p>
	}

	const {url: imageSourceUrl, alt: featuredImageAlt} =
		getFeaturedImageDetails(member, 'medium');
	const hasAttachment = member.meta.attachment && member.meta.attachment.id;
	return (
		<div {...props} ref={ref}>
			{children}
			{imageSourceUrl && <img src={imageSourceUrl} alt={featuredImageAlt}/>}
			<div className={"npseudo-card-body"}>
				<h5>{decodeEntities(member.meta.member_name || "Vacant")}</h5>{member.meta.member_pronouns && <span className="npseudo-pronouns">({member.meta.member_pronouns})</span>}
				<h6>{member.meta.position}</h6>
				{member.meta.member_email && <a href={"mailto:" + member.meta.member_email}>Email Me</a>}
				{hasAttachment && <a href={member.meta.attachment.url}>Manifesto</a>}
				{member.content.rendered.replace(/(<([^>]+)>)/gi, "").trim() && <MoreInfoItem id={member.id}><div  dangerouslySetInnerHTML={{ __html: member.content.rendered.trim()}}/></MoreInfoItem>}
			</div>
		</div>
	);
}

export const Member = forwardRef(RawMember)
